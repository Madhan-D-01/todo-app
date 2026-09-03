package com.example.TodoListBackend.services;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.TodoListBackend.models.Task;
import com.example.TodoListBackend.repositories.TaskRepository;

@Service
public class TaskService {
	@Autowired
	private TaskRepository taskRepository;

	public Task createNewTask(Task task) {
		return taskRepository.save(task);
	}

	public List<Task> findByUserId(Long userId) {
		return taskRepository.findByUserId(userId);
	}

	public List<Task> getAllTask() {
		return taskRepository.findAll();
	}

	public Task findTaskById(Long id) {
		return taskRepository.findById(id).orElse(null);
	}

	public List<Task> findCompletedByUserId(Long userId, boolean completed) {
		return taskRepository.findByUserIdAndCompleted(userId, completed);
	}

	public void deleteTaskById(Long id) {
		taskRepository.deleteById(id);
	}

	public Task updateTask(Task task) {
		return taskRepository.save(task);
	}
}
