package com.ims.mailhub.repository;

import com.ims.mailhub.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByEmailId(Long emailId);
    List<Task> findByUserId(Long userId);
    List<Task> findByUserIdAndStatus(Long userId, String status);
    List<Task> findByDueDateBetween(LocalDateTime start, LocalDateTime end);
}
