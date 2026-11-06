package com.example.todo.service;

import com.example.todo.dto.request.CreateTodoRequest;
import com.example.todo.dto.request.UpdateTodoRequest;
import com.example.todo.dto.response.PageResponse;
import com.example.todo.dto.response.TodoResponse;
import com.example.todo.dto.response.TodoStatsResponse;
import com.example.todo.entity.Priority;
import org.springframework.data.domain.Pageable;

public interface TodoService {

    PageResponse<TodoResponse> getTodos(String search, Boolean completed, Priority priority, Pageable pageable);

    TodoResponse getTodoById(Long id);

    TodoResponse createTodo(CreateTodoRequest request);

    TodoResponse updateTodo(Long id, UpdateTodoRequest request);

    TodoResponse updateTodoStatus(Long id, Boolean completed);

    void deleteTodo(Long id);

    TodoStatsResponse getStats();
}
