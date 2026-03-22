package com.ims.mailhub.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ims.mailhub.dto.AIExtractionResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiAIService {

    private static final Logger log = LoggerFactory.getLogger(GeminiAIService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    // Stores the last error for diagnostic endpoint
    private String lastError = null;
    private long lastCallTime = 0;

    public String getLastError() {
        return lastError;
    }

    private String buildSystemPrompt() {
        String todayDate = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
        return "You are an intelligent email classifier for a college student's IMS (Information Management System). "
            + "Analyze the given email and return a JSON response with the following structure. "
            + "Return ONLY valid JSON, no markdown, no explanation.\n\n"
            + "{\n"
            + "  \"category\": \"<one of: exam, assign, club, circular, fee, placement, holiday, general>\",\n"
            + "  \"isUrgent\": \"<true or false>\",\n"
            + "  \"urgency\": \"<high, medium, or low>\",\n"
            + "  \"summary\": \"<one line summary of the email, max 100 chars>\",\n"
            + "  \"sender_role\": \"<one of: Faculty, Admin, Finance Office, Exam Controller, Club/Student Body, Company/Recruiter, Unknown>\",\n"
            + "  \"tasks\": [\n"
            + "    {\n"
            + "      \"title\": \"<actionable task starting with a verb: Submit/Register/Pay/Attend/Download/Complete/Review>\",\n"
            + "      \"priority\": \"<HIGH, MEDIUM, or LOW>\",\n"
            + "      \"due\": \"<human-readable deadline like 'Jan 17, 2025' or 'No deadline'>\",\n"
            + "      \"confidence\": \"<number 60-99, overall confidence for this task>\",\n"
            + "      \"confTaskIntent\": \"<number 60-99, how clear the task intent is>\",\n"
            + "      \"confDeadline\": \"<number 60-99, how clearly the deadline was stated>\",\n"
            + "      \"confPriorityReason\": \"<number 60-99, how justified the priority level is>\",\n"
            + "      \"confTagAccuracy\": \"<number 60-99, how accurately the category tag matches>\",\n"
            + "      \"confSenderAuthority\": \"<number 60-99, how authoritative the sender is>\",\n"
            + "      \"deepLink\": \"<one of: exam, lms, fee, placement, calendar, circular, none>\"\n"
            + "    }\n"
            + "  ],\n"
            + "  \"ai_confidence\": {\n"
            + "    \"overall\": \"<0-100>\",\n"
            + "    \"task_intent_clarity\": \"<0-100>\",\n"
            + "    \"deadline_extraction\": \"<0-100>\",\n"
            + "    \"priority_reasoning\": \"<0-100>\",\n"
            + "    \"tag_accuracy\": \"<0-100>\",\n"
            + "    \"sender_authority\": \"<0-100>\"\n"
            + "  },\n"
            + "  \"confidence_verdict\": \"<one of: High confidence | Medium confidence — review recommended | Low confidence — manual review required>\"\n"
            + "}\n\n"
            + "STRICT CATEGORY RULES — you MUST follow these exactly:\n"
            + "- exam: ANY email about tests, CAT, exams, hall tickets, timetables, results, revaluation, lab assessments, internal marks, cycle tests, viva for exams\n"
            + "- assign: ANY email about assignments, projects, submissions, reports, GitHub uploads, LMS submissions, mini projects, viva for projects\n"
            + "- club: ANY email about events, hackathons, competitions, guest lectures, seminars, workshops, sports, tournaments, cultural events, club activities, technical talks, team selections\n"
            + "- circular: ANY official notice, attendance warning, scholarship, policy, condonation, academic calendar, HOD notices, university circulars, detain lists, revised schedules\n"
            + "- fee: ANY email about fee payments, installments, hostel fees, bus pass fees, fine amounts, penalty amounts, tuition fee\n"
            + "- placement: ANY email about campus drives, recruitment, companies visiting, job opportunities, internships, aptitude tests for companies\n"
            + "- holiday: ANY email about college closures, holidays, festival breaks, schedule cancellations\n"
            + "- general: ONLY use this for personal emails, promotional emails, non-college emails, spam, shopping, social media, ecommerce\n"
            + "IMPORTANT: Never classify a college email as general. College email domains include: @college.edu, @university.edu, any .edu domain.\n"
            + "DISAMBIGUATION: Attendance warnings/detain lists = circular (NOT exam). Scholarship notifications = circular (NOT fee). Guest lectures/seminars = club (NOT general). Sports events = club.\n\n"
            + "isUrgent RULES: isUrgent=true WHEN subject contains URGENT/IMPORTANT/ACTION REQUIRED/LAST DATE/FINAL REMINDER, OR body mentions detention/failure/hall ticket blocked/immediate action, OR penalty with near deadline.\n\n"
            + "PRIORITY RULES:\n"
            + "- HIGH: today/tomorrow deadline OR URGENT keyword OR penalty mentioned OR detention/failure risk OR last date within 3 days OR fee with penalty\n"
            + "- MEDIUM: deadline within 7 days OR exam scheduled OR assignment due this week OR registration deadline soon\n"
            + "- LOW: informational only OR holiday notice OR event more than 2 weeks away OR no deadline mentioned\n\n"
            + "- Extract ALL actionable tasks (register, pay, submit, attend, download, verify, etc.).\n"
            + "- Min 1 task, max 6 tasks. Start each task title with a verb.\n"
            + "- For deadlines, extract exact dates if mentioned. Relative dates resolve from today: " + todayDate + ".\n"
            + "- CRITICAL: Each confidence field MUST be a DIFFERENT integer between 60-99, reflecting actual analysis quality. "
            + "Do NOT use the same value for all fields. Vary them based on how clearly each aspect was stated.\n"
            + "- sender_role should be inferred from sender name, email domain, and content.\n"
            + "- All confidence scores must be realistic — base them on how clearly info was stated in the email.";
    }

    @SuppressWarnings("unchecked")
    public AIExtractionResult classify(String sender, String subject, String body) {
        log.info("=== GEMINI AI CLASSIFICATION START ===");
        lastError = null;
        log.info("Sender: {}", sender);
        log.info("Subject: {}", subject);
        log.info("Body length: {} chars", body != null ? body.length() : 0);

        // Rate limiter: ensure minimum 20 seconds between calls
        long now = System.currentTimeMillis();
        long elapsed = now - lastCallTime;
        if (elapsed < 20000 && lastCallTime > 0) {
            try {
                long waitTime = 20000 - elapsed;
                log.info("Rate limiting: waiting {}ms before Gemini call", waitTime);
                Thread.sleep(waitTime);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        lastCallTime = System.currentTimeMillis();

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String systemPrompt = buildSystemPrompt();
            String userPrompt = "Sender Email: " + sender + "\nSubject: " + subject + "\n\nBody:\n" + body;

            Map<String, Object> payload = Map.of(
                "system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", userPrompt)))),
                "generationConfig", Map.of("temperature", 0.1, "maxOutputTokens", 2000)
            );

            log.info("Calling Gemini API...");

            ResponseEntity<Map> resp = null;
            int maxRetries = 3;
            for (int attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    resp = restTemplate.postForEntity(
                        GEMINI_URL + apiKey,
                        new HttpEntity<>(payload, headers),
                        Map.class
                    );
                    break; // success
                } catch (HttpClientErrorException retryEx) {
                    if (retryEx.getStatusCode().value() == 429 && attempt < maxRetries) {
                        long waitSecs = attempt * 30L; // 30s, 60s, 90s
                        log.warn("Gemini rate limited (429), retrying in {}s (attempt {}/{})", waitSecs, attempt, maxRetries);
                        Thread.sleep(waitSecs * 1000);
                    } else {
                        throw retryEx; // re-throw non-429 or final attempt
                    }
                }
            }

            log.info("Gemini API response status: {}", resp.getStatusCode());

            Map<String, Object> responseBody = resp.getBody();

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                log.error("No candidates in Gemini response!");
                return getFallbackResult(subject);
            }

            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            String rawJson = (String) parts.get(0).get("text");

            log.info("Raw Gemini text output: {}", rawJson);

            // Clean markdown fences if present
            rawJson = rawJson.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();

            log.info("Cleaned JSON for parsing: {}", rawJson);

            AIExtractionResult result = objectMapper.readValue(rawJson, AIExtractionResult.class);

            log.info("=== PARSED RESULT ===");
            log.info("Category: {} → effective: {}", result.getCategory(), result.getEffectiveCategory());
            log.info("Urgency: {} → effective: {}", result.getUrgency(), result.getEffectiveUrgency());
            log.info("IsUrgent flag: {}", result.getIsUrgent());
            log.info("Summary: {}", result.getEffectiveSummary());
            log.info("Sender role: {}", result.getSenderRole());
            log.info("Confidence verdict: {}", result.getConfidenceVerdict());

            // Log AI confidence block
            if (result.getAiConfidence() != null) {
                AIExtractionResult.AIConfidence ac = result.getAiConfidence();
                log.info("AI Confidence → overall={} intent={} deadline={} priority={} tag={} sender={}",
                    ac.getOverall(), ac.getTaskIntentClarity(), ac.getDeadlineExtraction(),
                    ac.getPriorityReasoning(), ac.getTagAccuracy(), ac.getSenderAuthority());
            }

            // Log per-task details
            if (result.getTasks() != null) {
                for (int i = 0; i < result.getTasks().size(); i++) {
                    AIExtractionResult.ExtractedTask t = result.getTasks().get(i);
                    log.info("Task[{}]: title='{}' priority={} due='{}' confidence={} intent={} deadline={} priority_reason={} tag={} sender={}",
                        i, t.getTitle(), t.getPriority(), t.getEffectiveDue(),
                        t.getConfidence(), t.getConfTaskIntent(), t.getConfDeadline(),
                        t.getConfPriorityReason(), t.getConfTagAccuracy(), t.getConfSenderAuthority());
                }
            }
            log.info("=== GEMINI AI CLASSIFICATION END ===");

            return result;
        } catch (HttpClientErrorException e) {
            log.error("=== GEMINI API CLIENT ERROR ===");
            log.error("HTTP Status: {}", e.getStatusCode());
            log.error("Response Body: {}", e.getResponseBodyAsString());
            log.error("This usually means: invalid API key, quota exceeded, or model not found");
            lastError = "HTTP " + e.getStatusCode() + ": " + e.getResponseBodyAsString();
            return getFallbackResult(subject);
        } catch (HttpServerErrorException e) {
            log.error("=== GEMINI API SERVER ERROR ===");
            log.error("HTTP Status: {}", e.getStatusCode());
            log.error("Response Body: {}", e.getResponseBodyAsString());
            lastError = "HTTP " + e.getStatusCode() + ": " + e.getResponseBodyAsString();
            return getFallbackResult(subject);
        } catch (Exception e) {
            log.error("=== GEMINI AI CLASSIFICATION FAILED ===");
            log.error("Error type: {}", e.getClass().getSimpleName());
            log.error("Error message: {}", e.getMessage());
            log.error("Full error details: ", e);
            if (e instanceof org.springframework.web.client.HttpClientErrorException httpEx) {
                log.error("HTTP Status: {}", httpEx.getStatusCode());
                log.error("Response body: {}", httpEx.getResponseBodyAsString());
            }
            lastError = e.getClass().getSimpleName() + ": " + e.getMessage();
            return getFallbackResult(subject);
        }
    }

    private AIExtractionResult getFallbackResult(String subject) {
        log.warn("Using FALLBACK result for subject: {}", subject);
        AIExtractionResult result = new AIExtractionResult();
        result.setCategory("general");
        result.setUrgency("low");
        result.setSummary("Email processed: " + (subject != null && subject.length() > 80
            ? subject.substring(0, 80) + "..." : subject));
        AIExtractionResult.ExtractedTask task = new AIExtractionResult.ExtractedTask();
        task.setTitle("Review email: " + (subject != null && subject.length() > 60
            ? subject.substring(0, 60) + "..." : subject));
        task.setPriority("LOW");
        task.setDue("No deadline");
        task.setConfidence(70);
        task.setConfTaskIntent(65);
        task.setConfDeadline(60);
        task.setConfPriorityReason(68);
        task.setConfTagAccuracy(62);
        task.setConfSenderAuthority(64);
        task.setDeepLink("none");
        result.setTasks(List.of(task));
        return result;
    }
}
