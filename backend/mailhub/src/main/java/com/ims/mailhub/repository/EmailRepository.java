package com.ims.mailhub.repository;

import com.ims.mailhub.model.Email;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmailRepository extends JpaRepository<Email, Long> {
    List<Email> findByUserId(Long userId);
    List<Email> findByUserIdAndCategory(Long userId, String category);
    List<Email> findByUserIdAndIsReadFalse(Long userId);
    Optional<Email> findByGmailId(String gmailId);
    long countByIsUrgentTrue();
    long countByCategory(String category);
}
