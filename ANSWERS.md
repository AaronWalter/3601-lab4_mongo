## Questions

1. :question: What do we do in the `Server` and `UserController` constructors
to set up our connection to the development database?
2. :question: How do we retrieve a user by ID in the `UserController.getUser(String)` method?
3. :question: How do we retrieve all the users with a given age 
in `UserController.getUsers(Map...)`? What's the role of `filterDoc` in that
method?
4. :question: What are these `Document` objects that we use in the `UserController`? 
Why and how are we using them?
5. :question: What does `UserControllerSpec.clearAndPopulateDb` do?
6. :question: What's being tested in `UserControllerSpec.getUsersWhoAre37()`?
How is that being tested?
7. :question: Follow the process for adding a new user. What role do `UserController` and 
`UserRequestHandler` play in the process?

## Your Team's Answers

1. In Server's main method, we create a new Mongo client and get the "dev"
    database from it. We create a new UserController and pass the "dev"
    database to it. When that UserController is constructed, it gets the
    "users" collection from the "dev" database.

2. getUser makes a query to userCollection, which returns an iterable collection
    of documents that have that ID. Then getUser iterates over that collection
    and returns the first user if it exists, converting it to a string.
    
3. getUsers creates an empty document filterDoc, and appends all of the
    appropriate query parameters. When we get all the users of a certain
    age, filterDoc will have a key-value pair of "age" and the age
    we're looking for. getUsers creates an iterable collection of
    documents (just like getUser) and asks Mongo to return the records
    that satisfy the queries in filterDoc. getUserse uses
    serializeIterable to turn those records into a string and returns it.

4. The Document objects in userController are BSON objects. We're getting
    them from MongoDB because that's how it stores records. userController
    uses serializeIterable to translate a collection of BSON documents
    into a string, which can be used by the api.
    
5. clearAndPopulateDb is what we use for mocking when we want to test
    UserController. It gets the "test" database and the "users" collection,
    drops that collection, and fills it up with some made-up data for
    testing purposes.
    
6. 
