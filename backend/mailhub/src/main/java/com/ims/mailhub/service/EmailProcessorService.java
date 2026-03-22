package com.ims.mailhub.service;

import com.ims.mailhub.dto.AIExtractionResult;
import com.ims.mailhub.model.Email;
import com.ims.mailhub.model.Task;
import com.ims.mailhub.repository.EmailRepository;
import com.ims.mailhub.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmailProcessorService {

    private static final Logger log = LoggerFactory.getLogger(EmailProcessorService.class);

    @Autowired
    private EmailCleanerService emailCleanerService;

    @Autowired
    private GeminiAIService geminiAIService;

    @Autowired
    private EmailRepository emailRepository;

    @Autowired
    private TaskRepository taskRepository;

    public Email process(String sender, String subject, String body, Long userId) {
        String cleanBody = emailCleanerService.clean(body);
        AIExtractionResult result = geminiAIService.classify(sender, subject, cleanBody);

        // Use the effective helpers to normalize both prompt formats
        String category = result.getEffectiveCategory();
        String urgency = result.getEffectiveUrgency();
        String summary = result.getEffectiveSummary();
        boolean isUrgent = "high".equalsIgnoreCase(urgency) || Boolean.TRUE.equals(result.getIsUrgent());

        log.info("Processing email: category={} urgency={} isUrgent={} tasks={}",
            category, urgency, isUrgent, result.getTasks() != null ? result.getTasks().size() : 0);

        Email email = new Email();
        email.setUserId(userId);
        email.setSenderEmail(sender);
        email.setSenderName(extractSenderName(sender));
        email.setSubject(subject);
        email.setBodyRaw(body);
        email.setBodyClean(cleanBody);
        email.setReceivedAt(LocalDateTime.now());
        email.setCategory(category);
        email.setUrgency(urgency);
        email.setIsUrgent(isUrgent);
        email.setIsRead(false);
        email.setAiSummary(summary);
        email.setIsProcessed(true);

        Email savedEmail = emailRepository.save(email);

        saveTasks(result, savedEmail.getId(), userId);

        return savedEmail;
    }

    public Email processGmail(String gmailId, String sender, String senderName,
                               String subject, String body, Long userId) {
        if (emailRepository.findByGmailId(gmailId).isPresent()) {
            return null;
        }

        String cleanBody = emailCleanerService.clean(body);
        AIExtractionResult result = geminiAIService.classify(sender, subject, cleanBody);

        String category = result.getEffectiveCategory();
        String urgency = result.getEffectiveUrgency();
        String summary = result.getEffectiveSummary();
        boolean isUrgent = "high".equalsIgnoreCase(urgency) || Boolean.TRUE.equals(result.getIsUrgent());

        Email email = new Email();
        email.setUserId(userId);
        email.setGmailId(gmailId);
        email.setSenderEmail(sender);
        email.setSenderName(senderName != null ? senderName : extractSenderName(sender));
        email.setSubject(subject);
        email.setBodyRaw(body);
        email.setBodyClean(cleanBody);
        email.setReceivedAt(LocalDateTime.now());
        email.setCategory(category);
        email.setUrgency(urgency);
        email.setIsUrgent(isUrgent);
        email.setIsRead(false);
        email.setAiSummary(summary);
        email.setIsProcessed(true);

        Email savedEmail = emailRepository.save(email);

        saveTasks(result, savedEmail.getId(), userId);

        return savedEmail;
    }

    private void saveTasks(AIExtractionResult result, Long emailId, Long userId) {
        if (result.getTasks() == null || result.getTasks().isEmpty()) return;

        AIExtractionResult.AIConfidence globalConf = result.getAiConfidence();

        for (AIExtractionResult.ExtractedTask et : result.getTasks()) {
            Task task = new Task();
            task.setEmailId(emailId);
            task.setUserId(userId);
            task.setTitle(et.getTitle());
            task.setPriority(et.getPriority() != null ? et.getPriority().toUpperCase() : "MEDIUM");
            task.setDueRaw(et.getEffectiveDue());
            task.setDueDate(parseDueDate(et.getEffectiveDue()));
            task.setDeepLinkModule(et.getDeepLink());
            task.setStatus("ACTIVE");

            task.setConfidenceScore(resolveConf(et.getConfidence(),
                globalConf != null ? globalConf.getOverall() : null));
            task.setConfTaskIntent(resolveConf(et.getConfTaskIntent(),
                globalConf != null ? globalConf.getTaskIntentClarity() : null));
            task.setConfDeadline(resolveConf(et.getConfDeadline(),
                globalConf != null ? globalConf.getDeadlineExtraction() : null));
            task.setConfPriorityReason(resolveConf(et.getConfPriorityReason(),
                globalConf != null ? globalConf.getPriorityReasoning() : null));
            task.setConfTagAccuracy(resolveConf(et.getConfTagAccuracy(),
                globalConf != null ? globalConf.getTagAccuracy() : null));
            task.setConfSenderAuthority(resolveConf(et.getConfSenderAuthority(),
                globalConf != null ? globalConf.getSenderAuthority() : null));

            log.info("Saving task: '{}' priority={} due='{}' dueDate={} conf={}/{}/{}/{}/{}/{}",
                task.getTitle(), task.getPriority(), task.getDueRaw(), task.getDueDate(),
                task.getConfidenceScore(), task.getConfTaskIntent(), task.getConfDeadline(),
                task.getConfPriorityReason(), task.getConfTagAccuracy(), task.getConfSenderAuthority());

            if (task.getDueDate() != null) {
                LocalDateTime start = task.getDueDate().minusDays(2);
                LocalDateTime end = task.getDueDate().plusDays(2);
                List<Task> nearby = taskRepository.findByDueDateBetween(start, end);
                if (!nearby.isEmpty()) {
                    task.setHasCollision(true);
                    task.setCollisionDetail("Conflicts with " + nearby.size() + " task(s) within ±2 days");
                }
            }

            taskRepository.save(task);
        }
    }

    private LocalDateTime parseDueDate(String dueRaw) {
        if (dueRaw == null || dueRaw.isBlank() || dueRaw.equalsIgnoreCase("No deadline"))
            return null;

        String[] patterns = {
            "MMM dd, yyyy",
            "MMM d, yyyy",
            "MMMM dd, yyyy",
            "MMMM d, yyyy",
            "yyyy-MM-dd",
            "dd/MM/yyyy",
            "MM/dd/yyyy",
            "dd-MM-yyyy",
            "MMM dd",
            "MMM d",
        };

        String cleaned = dueRaw.replaceAll("\\s+\\d{1,2}:\\d{2}\\s*(AM|PM|am|pm)?", "").trim();
        cleaned = cleaned.replaceAll("(?i)^(by|before|on)\\s+", "").trim();

        for (String pattern : patterns) {
            try {
                java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter
                    .ofPattern(pattern, java.util.Locale.ENGLISH);
                if (pattern.contains("yyyy")) {
                    return java.time.LocalDate.parse(cleaned, fmt).atTime(23, 59);
                } else {
                    java.time.MonthDay md = java.time.MonthDay.parse(cleaned, fmt);
                    int year = java.time.LocalDate.now().getYear();
                    return md.atYear(year).atTime(23, 59);
                }
            } catch (Exception ignored) {}
        }

        log.warn("Could not parse due date: '{}'", dueRaw);
        return null;
    }

    /**
     * Resolves a confidence value: prefers per-task, then global, then defaults to 70.
     */
    private int resolveConf(Integer perTask, Integer global) {
        if (perTask != null && perTask > 0) return perTask;
        if (global != null && global > 0) return global;
        return 70;
    }

    private String extractSenderName(String sender) {
        if (sender == null) return "Unknown";
        if (sender.contains("@")) {
            String local = sender.split("@")[0];
            return local.replace(".", " ").replace("_", " ");
        }
        return sender;
    }
}
