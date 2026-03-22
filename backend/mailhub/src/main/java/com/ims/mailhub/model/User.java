package com.ims.mailhub.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "roll_number", unique = true, nullable = false, length = 20)
    private String rollNumber;

    @Column(unique = true, nullable = false, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(length = 50)
    private String department;

    private Integer semester;

    @Column(name = "gmail_refresh_token", columnDefinition = "TEXT")
    private String gmailRefreshToken;

    @Column(name = "gmail_access_token", columnDefinition = "TEXT")
    private String gmailAccessToken;

    @Column(name = "token_expiry")
    private Long tokenExpiry;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
