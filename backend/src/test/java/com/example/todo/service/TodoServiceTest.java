package com.example.todo.service;

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
import com.example.todo.service.impl.TodoServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TodoServiceTest {

    @Mock
    private TodoRepository todoRepository;

    private TodoMapper todoMapper;
    private TodoServiceImpl todoService;

    private Todo sampleTodo;

    @BeforeEach
    void setUp() {
        todoMapper = new TodoMapper();
        todoService = new TodoServiceImpl(todoRepository, todoMapper);

        sampleTodo = Todo.builder()
                .id(1L)
                .title("Học Spring Boot 3")
                .description("Tìm hiểu kiến trúc layered và clean code")
                .completed(false)
                .priority(Priority.HIGH)
                .dueDate(LocalDateTime.now().plusDays(2))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Tạo Todo mới thành công")
    void createTodo_Success() {
        CreateTodoRequest request = CreateTodoRequest.builder()
                .title("Học Spring Boot 3")
                .description("Tìm hiểu kiến trúc layered và clean code")
                .priority(Priority.HIGH)
                .dueDate(sampleTodo.getDueDate())
                .build();

        when(todoRepository.save(any(Todo.class))).thenAnswer(invocation -> {
            Todo todo = invocation.getArgument(0);
            todo.setId(1L);
            todo.setCreatedAt(LocalDateTime.now());
            todo.setUpdatedAt(LocalDateTime.now());
            return todo;
        });

        TodoResponse response = todoService.createTodo(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getTitle()).isEqualTo("Học Spring Boot 3");
        assertThat(response.getPriority()).isEqualTo(Priority.HIGH);
        assertThat(response.getCompleted()).isFalse();

        verify(todoRepository).save(any(Todo.class));
    }

    @Test
    @DisplayName("Lấy chi tiết Todo theo ID thành công")
    void getTodoById_Success() {
        when(todoRepository.findById(1L)).thenReturn(Optional.of(sampleTodo));

        TodoResponse response = todoService.getTodoById(1L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getTitle()).isEqualTo(sampleTodo.getTitle());
    }

    @Test
    @DisplayName("Lấy chi tiết Todo ném ResourceNotFoundException khi ID không tồn tại")
    void getTodoById_NotFound() {
        when(todoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> todoService.getTodoById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("Cập nhật Todo thành công")
    void updateTodo_Success() {
        UpdateTodoRequest request = UpdateTodoRequest.builder()
                .title("Học Spring Boot 3 Nâng Cao")
                .description("Cập nhật kiến thức microservices")
                .completed(true)
                .priority(Priority.MEDIUM)
                .dueDate(LocalDateTime.now().plusDays(5))
                .build();

        when(todoRepository.findById(1L)).thenReturn(Optional.of(sampleTodo));
        when(todoRepository.save(any(Todo.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TodoResponse response = todoService.updateTodo(1L, request);

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Học Spring Boot 3 Nâng Cao");
        assertThat(response.getDescription()).isEqualTo("Cập nhật kiến thức microservices");
        assertThat(response.getCompleted()).isTrue();
        assertThat(response.getPriority()).isEqualTo(Priority.MEDIUM);

        verify(todoRepository).save(sampleTodo);
    }

    @Test
    @DisplayName("Cập nhật Todo ném ResourceNotFoundException khi ID không tồn tại")
    void updateTodo_NotFound() {
        UpdateTodoRequest request = UpdateTodoRequest.builder()
                .title("Update")
                .build();

        when(todoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> todoService.updateTodo(99L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Cập nhật trạng thái completed thành công")
    void updateTodoStatus_Success() {
        when(todoRepository.findById(1L)).thenReturn(Optional.of(sampleTodo));
        when(todoRepository.save(any(Todo.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TodoResponse response = todoService.updateTodoStatus(1L, true);

        assertThat(response).isNotNull();
        assertThat(response.getCompleted()).isTrue();
        verify(todoRepository).save(sampleTodo);
    }

    @Test
    @DisplayName("Xóa Todo thành công khi ID tồn tại")
    void deleteTodo_Success() {
        when(todoRepository.existsById(1L)).thenReturn(true);

        todoService.deleteTodo(1L);

        verify(todoRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Xóa Todo ném ResourceNotFoundException khi ID không tồn tại")
    void deleteTodo_NotFound() {
        when(todoRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> todoService.deleteTodo(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Tìm kiếm và phân trang Todos thành công")
    void getTodos_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Todo> page = new PageImpl<>(List.of(sampleTodo), pageable, 1);

        when(todoRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        PageResponse<TodoResponse> response = todoService.getTodos("Spring", false, Priority.HIGH, pageable);

        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getTotalElements()).isEqualTo(1);
        assertThat(response.getContent().get(0).getTitle()).isEqualTo(sampleTodo.getTitle());
    }

    @Test
    @DisplayName("Lấy thống kê số lượng Todos thành công")
    void getStats_Success() {
        when(todoRepository.count()).thenReturn(10L);
        when(todoRepository.countByCompleted(true)).thenReturn(4L);
        when(todoRepository.countByCompleted(false)).thenReturn(6L);
        when(todoRepository.countByPriority(Priority.HIGH)).thenReturn(3L);

        TodoStatsResponse stats = todoService.getStats();

        assertThat(stats.getTotal()).isEqualTo(10L);
        assertThat(stats.getCompleted()).isEqualTo(4L);
        assertThat(stats.getPending()).isEqualTo(6L);
        assertThat(stats.getHighPriority()).isEqualTo(3L);
    }
}
