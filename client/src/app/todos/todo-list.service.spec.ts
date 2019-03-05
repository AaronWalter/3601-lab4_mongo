import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';

import {Todo} from './todo';
import {TodoListService} from './todo-list.service';

describe('Todo list service: ', () => {
  // A small collection of test todos
  const testTodos: Todo[] = [
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
  ];
  const vgTodos: Todo[] = testTodos.filter(todo =>
    todo.category.toLowerCase().indexOf('v') !== -1
  );

  // We will need some url information from the todoListService to meaningfully test category filtering;
  // https://stackoverflow.com/questions/35987055/how-to-write-unit-testing-for-angular-2-typescript-for-private-methods-with-ja
  let todoListService: TodoListService;
  let currentlyImpossibleToGenerateSearchTodoUrl: string;

  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    // Construct an instance of the service with the mock
    // HTTP client.
    todoListService = new TodoListService(httpClient);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('getTodos() calls api/todos', () => {
    // Assert that the todos we get from this call to getTodos()
    // should be our set of test todos. Because we're subscribing
    // to the result of getTodos(), this won't actually get
    // checked until the mocked HTTP request "returns" a response.
    // This happens when we call req.flush(testTodos) a few lines
    // down.
    todoListService.getTodos().subscribe(
      todos => expect(todos).toBe(testTodos)
    );

    // Specify that (exactly) one request will be made to the specified URL.
    const req = httpTestingController.expectOne(todoListService.baseUrl);
    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');
    // Specify the content of the response to that request. This
    // triggers the subscribe above, which leads to that check
    // actually being performed.
    req.flush(testTodos);
  });

  it('getTodos(todoCategory) adds appropriate param string to called URL', () => {
    todoListService.getTodos(null, "v").subscribe(
      todos => expect(todos).toEqual(vgTodos)
    );

    const req = httpTestingController.expectOne(todoListService.baseUrl + '?category=v&');
    expect(req.request.method).toEqual('GET');
    req.flush(vgTodos);
  });

  it('filterByCategory(todoCategory) deals appropriately with a URL that already had a category', () => {
    currentlyImpossibleToGenerateSearchTodoUrl = todoListService.baseUrl + '?category=f&something=k&';
    todoListService['todoUrl'] = currentlyImpossibleToGenerateSearchTodoUrl;
    todoListService.filterByCategory('v');
    expect(todoListService['todoUrl']).toEqual(todoListService.baseUrl + '?something=k&category=v&');
  });

  it('filterByCategory(todoCategory) deals appropriately with a URL that already had some filtering, but no category', () => {
    currentlyImpossibleToGenerateSearchTodoUrl = todoListService.baseUrl + '?something=k&';
    todoListService['todoUrl'] = currentlyImpossibleToGenerateSearchTodoUrl;
    todoListService.filterByCategory('v');
    expect(todoListService['todoUrl']).toEqual(todoListService.baseUrl + '?something=k&category=v&');
  });

  it('filterByCategory(todoCategory) deals appropriately with a URL has the keyword category, but nothing after the =', () => {
    currentlyImpossibleToGenerateSearchTodoUrl = todoListService.baseUrl + '?category=&';
    todoListService['todoUrl'] = currentlyImpossibleToGenerateSearchTodoUrl;
    todoListService.filterByCategory('');
    expect(todoListService['todoUrl']).toEqual(todoListService.baseUrl + '');
  });

  it('getTodoById() calls api/todos/id', () => {
    const targetTodo: Todo = testTodos[1];
    const targetId: string = targetTodo._id;
    todoListService.getTodoById(targetId).subscribe(
      todo => expect(todo).toBe(targetTodo)
    );

    const expectedUrl: string = todoListService.baseUrl + '/' + targetId;
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual('GET');
    req.flush(targetTodo);
  });

  it('adding a todo calls api/todos/new', () => {
    const jesse_id = 'jesse_id';
    const newTodo: Todo = {
      _id: '',
      owner: 'Jesse',
      status: true,
      body: 'Smithsonian',
      category: 'jesse@stuff.com'
    };

    todoListService.addNewTodo(newTodo).subscribe(
      id => {
        expect(id).toBe(jesse_id);
      }
    );

    const expectedUrl: string = todoListService.baseUrl + '/new';
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual('POST');
    req.flush(jesse_id);
  });

});



