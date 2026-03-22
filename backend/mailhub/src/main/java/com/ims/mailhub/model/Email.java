package com.ims.mailhub.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "emails")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Email {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "gmail_id")
    private String gmailId;

    @Column(name = "sender_email", nullable = false, length = 150)
    private String senderEmail;

    @Column(name = "sender_name", length = 150)
    private String senderName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String subject;

    @Column(name = "body_raw", columnDefinition = "LONGTEXT")
    private String bodyRaw;

    @Column(name = "body_clean", columnDefinition = "TEXT")
    private String bodyClean;

    @Column(name = "received_at")
    private LocalDateTime receivedAt;

    @Column(columnDefinition = "ENUM('exam','assign','club','circular','fee','placement','holiday','general') DEFAULT 'general'")
    private String category;

    @Column(columnDefinition = "ENUM('high','medium','low') DEFAULT 'low'")
    private String urgency;

    @Column(name = "is_urgent")
    private Boolean isUrgent = false;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @Column(name = "is_processed")
    private Boolean isProcessed = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Transient
    private List<Task> tasks;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
