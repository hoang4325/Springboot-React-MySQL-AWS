package com.example.todo.service.impl;

import com.example.todo.dto.request.CreateTodoRequest;
import com.example.todo.dto.request.UpdateTodoRequest;
import com.example.todo.dto.response.PageResponse;
import com.example.todo.dto.response.TodoResponse;
import com.example.todo.dto.response.TodoStatsResponse;
import com.example.todo.entity.Priority;
import com.example.todo.entity.Todo;
import com.example.todo.exception.ResourceNotFoundException;
import com.example.todo.mapper.TodoMapper;
import com.example.todo.repository.TodoRepository;
import com.example.todo.repository.TodoSpecification;
import com.example.todo.service.TodoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TodoServiceImpl implements TodoService {

    private final TodoRepository todoRepository;
    private final TodoMapper todoMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TodoResponse> getTodos(String search, Boolean completed, Priority priority, Pageable pageable) {
        log.debug("Fetching todos with search='{}', completed={}, priority={}, pageable={}", search, completed, priority, pageable);
        Specification<Todo> spec = TodoSpecification.withFilters(search, completed, priority);
        Page<Todo> page = todoRepository.findAll(spec, pageable);
        Page<TodoResponse> responsePage = page.map(todoMapper::toResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public TodoResponse getTodoById(Long id) {
        log.debug("Fetching todo with id={}", id);
        Todo todo = findEntityById(id);
        return todoMapper.toResponse(todo);
    }

    @Override
    @Transactional
    public TodoResponse createTodo(CreateTodoRequest request) {
        log.info("Creating new todo with title='{}'", request.getTitle());
        Todo todo = todoMapper.toEntity(request);
        Todo savedTodo = todoRepository.save(todo);
        log.info("Successfully created todo id={}", savedTodo.getId());
        return todoMapper.toResponse(savedTodo);
    }

    @Override
    @Transactional
    public TodoResponse updateTodo(Long id, UpdateTodoRequest request) {
        log.info("Updating todo id={}", id);
        Todo todo = findEntityById(id);
        todoMapper.updateEntityFromDto(todo, request);
        Todo updatedTodo = todoRepository.save(todo);
        log.info("Successfully updated todo id={}", id);
        return todoMapper.toResponse(updatedTodo);
    }

    @Override
    @Transactional
    public TodoResponse updateTodoStatus(Long id, Boolean completed) {
        log.info("Updating status of todo id={} to completed={}", id, completed);
        Todo todo = findEntityById(id);
        todo.setCompleted(completed);
        Todo updatedTodo = todoRepository.save(todo);
        return todoMapper.toResponse(updatedTodo);
    }

    @Override
    @Transactional
    public void deleteTodo(Long id) {
        log.info("Deleting todo id={}", id);
        if (!todoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Todo", "id", id);
        }
        todoRepository.deleteById(id);
        log.info("Successfully deleted todo id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public TodoStatsResponse getStats() {
        long total = todoRepository.count();
        long completed = todoRepository.countByCompleted(true);
        long pending = todoRepository.countByCompleted(false);
        long highPriority = todoRepository.countByPriority(Priority.HIGH);

        return TodoStatsResponse.builder()
                .total(total)
                .completed(completed)
                .pending(pending)
                .highPriority(highPriority)
                .build();
    }

    private Todo findEntityById(Long id) {
        return todoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Todo", "id", id));
    }
}
