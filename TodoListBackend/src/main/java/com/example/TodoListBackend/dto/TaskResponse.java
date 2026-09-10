package com.example.TodoListBackend.dto;

import java.time.LocalDateTime;

import com.example.TodoListBackend.models.Priority;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {

	private Long id;
	private String task;
	private boolean completed;
	private LocalDateTime startDate;
	private LocalDateTime endDate;
	private Priority priority;
	private String category;
	private Long userId;
}
