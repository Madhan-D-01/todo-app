package com.example.TodoListBackend.services;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.TodoListBackend.models.User;
import com.example.TodoListBackend.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public User createUser(User user) {
		user.setPassword(passwordEncoder.encode(user.getPassword()));
		return userRepository.save(user);
	}
	public Optional<User> getUserById(Long id){
		return userRepository.findById(id);
	}
	public Optional<User> getUserByUserName(String username){
		return userRepository.findByUsername(username);
	}
	public boolean checkPassword(String rawPassword,String encodedPassword) {
		return passwordEncoder.matches(rawPassword, encodedPassword);
	}
}
