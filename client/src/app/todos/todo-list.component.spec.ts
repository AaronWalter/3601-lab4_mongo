import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Observable} from 'rxjs/Observable';
import {FormsModule} from '@angular/forms';
import {MATERIAL_COMPATIBILITY_MODE} from '@angular/material';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';

import {CustomModule} from '../custom.module';

import {Todo} from './todo';
import {TodoListComponent} from './todo-list.component';
import {TodoListService} from './todo-list.service';

describe('Todo list', () => {

  let todoList: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;

  let todoListServiceStub: {
    getTodos: () => Observable<Todo[]>
  };

  beforeEach(() => {
    // stub TodoService for test purposes
    todoListServiceStub = {
      getTodos: () => Observable.of([
        {
          _id: "58895985099029320e5242a0",
          owner: "Blanche",
          status: true,
          body: "Est ex commodo laboris aliquip Lorem voluptate mollit sint ex consequat. Culpa eiusmod pariatur ex veniam exercitation qui.",
          category: "groceries"
        },
        {
          _id: "588959852a278361a5ea251a",
          owner: "Dawn",
          status: false,
          body: "Id dolor culpa quis dolore elit sunt dolore. Amet adipisicing duis aliquip deserunt ut fugiat dolore.",
          category: "software design"
        },
        {
          _id: "58895985fac640cc6cb5f3b0",
          owner: "Roberta",
          status: false,
          body: "Pariatur ea et incididunt tempor eu voluptate laborum irure cupidatat adipisicing. Consequat occaecat consectetur qui culpa dolor.",
          category: "video games"
        }
      ])
    };

    TestBed.configureTestingModule({
      imports: [CustomModule],
      declarations: [TodoListComponent],
      // providers:    [ TodoListService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [{provide: TodoListService, useValue: todoListServiceStub},
        {provide: MATERIAL_COMPATIBILITY_MODE, useValue: true}]

    });
  });

  beforeEach(async(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(TodoListComponent);
      todoList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('contains all the todos', () => {
    expect(todoList.todos.length).toBe(3);
  });

  it('contains a todo with ID \'58895985099029320e5242a0\'', () => {
    expect(todoList.todos.some((todo: Todo) => todo._id === '58895985099029320e5242a0')).toBe(true);
  });

  it('contains a todo by \'Dawn\'', () => {
    expect(todoList.todos.some((todo: Todo) => todo.owner === 'Dawn')).toBe(true);
  });

  it('doesn\'t contain a todo by \'Santa\'', () => {
    expect(todoList.todos.some((todo: Todo) => todo.owner === 'Santa')).toBe(false);
  });

  it('has two todos that are incomplete', () => {
    expect(todoList.todos.filter((todo: Todo) => todo.status === false).length).toBe(2);
  });


  it('todo list filters by owner', () => {
    expect(todoList.filteredTodos.length).toBe(3);
    todoList.todoOwner = 'Workman';
    const a: Observable<Todo[]> = todoList.refreshTodos();
    a.do(x => Observable.of(x))
      .subscribe(x => expect(todoList.filteredTodos.length).toBe(0));
  });


});

describe('Misbehaving Todo List', () => {
  let todoList: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;

  let todoListServiceStub: {
    getTodos: () => Observable<Todo[]>
  };

  beforeEach(() => {
    // stub TodoService for test purposes
    todoListServiceStub = {
      getTodos: () => Observable.create(observer => {
        observer.error('Error-prone observable');
      })
    };

    TestBed.configureTestingModule({
      imports: [FormsModule, CustomModule],
      declarations: [TodoListComponent],
      providers: [{provide: TodoListService, useValue: todoListServiceStub},
        {provide: MATERIAL_COMPATIBILITY_MODE, useValue: true}]
    });
  });

  beforeEach(async(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(TodoListComponent);
      todoList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('generates an error if we don\'t set up a TodoListService', () => {
    // Since the observer throws an error, we don't expect todos to be defined.
    expect(todoList.todos).toBeUndefined();
  });
});
