package com.example.TodoListBackend.repositories;

import java.util.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.TodoListBackend.models.Task;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

	List<Task> findByUserId(Long userId);
	List<Task> findByUserIdAndCompleted(Long userId, boolean completed);

}
