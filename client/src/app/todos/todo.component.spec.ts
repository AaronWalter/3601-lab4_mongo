import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {Todo} from './todo';
import {TodoComponent} from './todo.component';
import {TodoListService} from './todo-list.service';
import {Observable} from 'rxjs/Observable';
import {CustomModule} from "../custom.module";

describe('Todo component', () => {

  let todoComponent: TodoComponent;
  let fixture: ComponentFixture<TodoComponent>;

  let todoListServiceStub: {
    getTodoById: (todoId: string) => Observable<Todo>
  };

  beforeEach(() => {
    // stub TodoService for test purposes
    todoListServiceStub = {
      getTodoById: (todoId: string) => Observable.of([
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
      ].find(todo => todo._id === todoId))
    };

    TestBed.configureTestingModule({
      imports: [CustomModule],
      declarations: [TodoComponent],
      providers: [{provide: TodoListService, useValue: todoListServiceStub}]
    });
  });

  beforeEach(async(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(TodoComponent);
      todoComponent = fixture.componentInstance;
    });
  }));

  it('can retrieve a todo by ID', () => {
    todoComponent.setId('58895985099029320e5242a0');
    expect(todoComponent.todo).toBeDefined();
    expect(todoComponent.todo.owner).toBe('Blanche');
    expect(todoComponent.todo.category).toBe('groceries');
  });

  it('returns undefined for a weird ID', () => {
    todoComponent.setId('Santa');
    expect(todoComponent.todo).not.toBeDefined();
  });

});
