package com.zoho.connect.repository;

import com.zoho.connect.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByGroupIdOrderByCreatedAtAsc(Long groupId);

    @Query("SELECT m FROM Message m WHERE (m.sender.id = :u1 AND m.recipientId = :u2) OR (m.sender.id = :u2 AND m.recipientId = :u1) ORDER BY m.createdAt ASC")
    List<Message> findDirectMessages(@Param("u1") Long userId1, @Param("u2") Long userId2);

    @Query("SELECT m FROM Message m WHERE m.recipientId = :userId OR m.sender.id = :userId OR (m.groupId IS NOT NULL AND m.groupId IN :groupIds) ORDER BY m.createdAt ASC")
    List<Message> findAllMessagesForUser(@Param("userId") Long userId, @Param("groupIds") List<Long> groupIds);
}
