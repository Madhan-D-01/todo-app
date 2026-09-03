package com.example.TodoListBackend.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TaskRequest {
	@NotBlank(message = "Task description is required")
	private String task;

	private boolean completed;

	private LocalDateTime startDate;
	private LocalDateTime endDate;

	@NotNull(message = "UserId is required")
	private Long userId;
}
