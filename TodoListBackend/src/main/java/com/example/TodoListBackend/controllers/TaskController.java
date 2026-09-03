package com.example.TodoListBackend.controllers;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.example.TodoListBackend.dto.TaskRequest;
import com.example.TodoListBackend.dto.TaskResponse;
import com.example.TodoListBackend.dto.UserResponse;
import com.example.TodoListBackend.exceptions.ResourceNotFoundException;
import com.example.TodoListBackend.models.Task;
import com.example.TodoListBackend.models.User;
import com.example.TodoListBackend.repositories.UserRepository;
import com.example.TodoListBackend.services.TaskService;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {
	@Autowired
	private TaskService taskService;

	@Autowired
	private UserRepository userRepository;

	private User getCurrentUser() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		String username = (String) auth.getPrincipal();
		return userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("Authenticatoin user not found" + username));
	}

	private TaskResponse toResponse(Task task) {
		return new TaskResponse(task.getId(), task.getTask(), task.isCompleted(), task.getStartDate(),
				task.getEndDate(), task.getUser() != null ? task.getUser().getId() : null);
	}

	private List<TaskResponse> toResponseList(List<Task> tasks) {
		return tasks.stream().map(task -> this.toResponse(task)).collect(Collectors.toList());
	}

	@GetMapping
	public ResponseEntity<List<TaskResponse>> getAllTasks() {
		User currentUser = getCurrentUser();
		return new ResponseEntity<>(toResponseList(taskService.findByUserId(currentUser.getId())), HttpStatus.OK);
	}

	@GetMapping("/completed")
	public ResponseEntity<List<TaskResponse>> getAllCompletedTasks() {
		User currentUser = getCurrentUser();
		return new ResponseEntity<>(toResponseList(taskService.findCompletedByUserId(currentUser.getId(), true)),
				HttpStatus.OK);
	}

	@GetMapping("/incompleted")
	public ResponseEntity<List<TaskResponse>> getAllInCompletedTasks() {
		User currentUser = getCurrentUser();
		return new ResponseEntity<>(toResponseList(taskService.findCompletedByUserId(currentUser.getId(), false)),
				HttpStatus.OK);
	}

	@PostMapping
	public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request) {
		User currentUser = getCurrentUser();

		Task task = Task.builder().task(request.getTask()).completed(request.isCompleted())
				.startDate(request.getStartDate()).endDate(request.getEndDate()).user(currentUser).build();
		Task saved = taskService.createNewTask(task);
		return new ResponseEntity<>(toResponse(saved), HttpStatus.CREATED);
	}

	@PutMapping("/{id}")
	public ResponseEntity<TaskResponse> updateTask(@PathVariable Long id,@Valid @RequestBody TaskRequest request) {
		User currentUser = getCurrentUser();
		Task existing = taskService.findTaskById(id);
		if (existing == null || !existing.getUser().getId().equals(currentUser.getId())) {
			return new ResponseEntity<>(HttpStatus.FORBIDDEN);
		}
		Task task = Task.builder().id(id).task(request.getTask()).completed(request.isCompleted())
				.startDate(request.getStartDate()).endDate(request.getEndDate()).user(currentUser).build();

		Task updated = taskService.updateTask(task);
		return new ResponseEntity<>(toResponse(updated), HttpStatus.OK);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
		User currentUser = getCurrentUser();
		Task existing = taskService.findTaskById(id);
		if (existing == null || !existing.getUser().getId().equals(currentUser.getId())) {
			return new ResponseEntity<>(HttpStatus.FORBIDDEN);
		}
		taskService.deleteTaskById(id);
		return new ResponseEntity<>(HttpStatus.NO_CONTENT);
	}

}
