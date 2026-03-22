package com.ims.mailhub.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email_id", nullable = false)
    private Long emailId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "ENUM('HIGH','MEDIUM','LOW') DEFAULT 'MEDIUM'")
    private String priority;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "due_raw", length = 200)
    private String dueRaw;

    @Column(name = "confidence_score")
    private Integer confidenceScore = 70;

    @Column(name = "conf_task_intent")
    private Integer confTaskIntent = 70;

    @Column(name = "conf_deadline")
    private Integer confDeadline = 70;

    @Column(name = "conf_priority_reason")
    private Integer confPriorityReason = 70;

    @Column(name = "conf_tag_accuracy")
    private Integer confTagAccuracy = 70;

    @Column(name = "conf_sender_authority")
    private Integer confSenderAuthority = 70;

    @Column(name = "has_collision")
    private Boolean hasCollision = false;

    @Column(name = "collision_detail", columnDefinition = "TEXT")
    private String collisionDetail;

    @Column(columnDefinition = "ENUM('PENDING_REVIEW','ACTIVE','DONE','SYNCED') DEFAULT 'ACTIVE'")
    private String status = "ACTIVE";

    @Column(name = "synced_to", length = 100)
    private String syncedTo;

    @Column(name = "deep_link_module", length = 50)
    private String deepLinkModule;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
