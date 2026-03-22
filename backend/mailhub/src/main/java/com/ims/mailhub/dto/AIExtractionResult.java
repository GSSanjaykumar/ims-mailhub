package com.ims.mailhub.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AIExtractionResult {

    private String category;
    private String urgency;
    private String summary;
    private List<ExtractedTask> tasks;

    // New fields from improved prompt
    @JsonProperty("isUrgent")
    private Boolean isUrgent;

    @JsonProperty("subject_summary")
    private String subjectSummary;

    @JsonProperty("sender_role")
    private String senderRole;

    @JsonProperty("ai_confidence")
    private AIConfidence aiConfidence;

    @JsonProperty("confidence_verdict")
    private String confidenceVerdict;

    private List<Deadline> deadlines;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ExtractedTask {
        private String title;
        private String priority;
        private String due;             // from old prompt
        private String deadline;        // from new prompt (YYYY-MM-DD)
        @JsonProperty("deadline_text")
        private String deadlineText;    // from new prompt (human readable)
        private Integer confidence;
        // Per-task confidence (old prompt puts these per-task)
        private Integer confTaskIntent;
        private Integer confDeadline;
        private Integer confPriorityReason;
        private Integer confTagAccuracy;
        private Integer confSenderAuthority;
        private String deepLink;

        /** Get the due string — prefers deadlineText, falls back to due */
        public String getEffectiveDue() {
            if (deadlineText != null && !deadlineText.isEmpty()) return deadlineText;
            if (deadline != null && !deadline.isEmpty()) return deadline;
            if (due != null && !due.isEmpty()) return due;
            return "No deadline";
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AIConfidence {
        private Integer overall;
        @JsonProperty("task_intent_clarity")
        private Integer taskIntentClarity;
        @JsonProperty("deadline_extraction")
        private Integer deadlineExtraction;
        @JsonProperty("priority_reasoning")
        private Integer priorityReasoning;
        @JsonProperty("tag_accuracy")
        private Integer tagAccuracy;
        @JsonProperty("sender_authority")
        private Integer senderAuthority;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Deadline {
        private String date;
        private String label;
    }

    /**
     * Maps the new prompt's category names to the DB enum values.
     * New prompt: "Exam/CAT" → "exam", "Assignments" → "assign", etc.
     */
    public String getEffectiveCategory() {
        if (category == null) return "general";
        return switch (category.toLowerCase()) {
            case "exam", "exam/cat" -> "exam";
            case "assign", "assignments" -> "assign";
            case "club", "club events" -> "club";
            case "circular", "circulars" -> "circular";
            case "fee", "fee/finance" -> "fee";
            case "placement" -> "placement";
            case "holiday", "holidays" -> "holiday";
            case "urgent" -> "general"; // urgent is a flag, not category
            default -> category.toLowerCase();
        };
    }

    /**
     * Derives urgency from new prompt's priority field or isUrgent flag.
     */
    public String getEffectiveUrgency() {
        if (urgency != null && !urgency.isEmpty()) return urgency.toLowerCase();
        if (Boolean.TRUE.equals(isUrgent)) return "high";
        return "low";
    }

    /**
     * Derives summary — prefers subjectSummary from new prompt, falls back to summary.
     */
    public String getEffectiveSummary() {
        if (summary != null && !summary.isEmpty()) return summary;
        if (subjectSummary != null && !subjectSummary.isEmpty()) return subjectSummary;
        return "";
    }
}
