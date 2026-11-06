package com.example.todo.mapper;

import com.example.todo.dto.request.CreateTodoRequest;
import com.example.todo.dto.request.UpdateTodoRequest;
import com.example.todo.dto.response.TodoResponse;
import com.example.todo.entity.Priority;
import com.example.todo.entity.Todo;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class TodoMapper {

    public Todo toEntity(CreateTodoRequest request) {
        if (request == null) {
            return null;
        }

        return Todo.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .priority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM)
                .completed(false)
                .dueDate(request.getDueDate())
                .build();
    }

    public void updateEntityFromDto(Todo todo, UpdateTodoRequest request) {
        if (todo == null || request == null) {
            return;
        }

        if (request.getTitle() != null) {
            todo.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            todo.setDescription(request.getDescription().trim());
        }
        if (request.getCompleted() != null) {
            todo.setCompleted(request.getCompleted());
        }
        if (request.getPriority() != null) {
            todo.setPriority(request.getPriority());
        }
        todo.setDueDate(request.getDueDate());
    }

    public TodoResponse toResponse(Todo todo) {
        if (todo == null) {
            return null;
        }

        return TodoResponse.builder()
                .id(todo.getId())
                .title(todo.getTitle())
                .description(todo.getDescription())
                .completed(todo.getCompleted())
                .priority(todo.getPriority())
                .dueDate(todo.getDueDate())
                .createdAt(todo.getCreatedAt())
                .updatedAt(todo.getUpdatedAt())
                .build();
    }

    public List<TodoResponse> toResponseList(List<Todo> todos) {
        if (todos == null || todos.isEmpty()) {
            return Collections.emptyList();
        }
        return todos.stream().map(this::toResponse).collect(Collectors.toList());
    }
}
