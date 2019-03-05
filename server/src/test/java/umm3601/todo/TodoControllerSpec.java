package umm3601.todo;

import com.mongodb.BasicDBObject;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.*;
import org.bson.codecs.*;
import org.bson.codecs.configuration.CodecRegistries;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.json.JsonReader;
import org.bson.types.ObjectId;
import org.junit.Before;
import org.junit.Test;

import java.util.*;
import java.util.stream.Collectors;

import static org.junit.Assert.*;

/**
 * JUnit tests for the TodoController.
 * <p>
 * Created by mcphee on 22/2/17.
 */
public class TodoControllerSpec {
  private TodoController todoController;
  private ObjectId samsId;

  @Before
  public void clearAndPopulateDB() {
    MongoClient mongoClient = new MongoClient();
    MongoDatabase db = mongoClient.getDatabase("test");
    MongoCollection<Document> todoDocuments = db.getCollection("todos");
    todoDocuments.drop();
    List<Document> testTodos = new ArrayList<>();
    testTodos.add(Document.parse("{\n" +
      "                    owner: \"Chris\",\n" +
      "                    status: true,\n" +
      "                    body: \"UMM\",\n" +
      "                    category: \"pokemon\"\n" +
      "                }"));
    testTodos.add(Document.parse("{\n" +
      "                    owner: \"Pat\",\n" +
      "                    status: false,\n" +
      "                    body: \"IBM\",\n" +
      "                    category: \"groceries\"\n" +
      "                }"));
    testTodos.add(Document.parse("{\n" +
      "                    owner: \"Jamie\",\n" +
      "                    status: true,\n" +
      "                    body: \"Frogs, Inc.\",\n" +
      "                    category: \"salad\"\n" +
      "                }"));

    samsId = new ObjectId();
    BasicDBObject sam = new BasicDBObject("_id", samsId);
    sam = sam.append("owner", "Sam")
      .append("status", false)
      .append("body", "Frogs, Inc.")
      .append("category", "salad");


    todoDocuments.insertMany(testTodos);
    todoDocuments.insertOne(Document.parse(sam.toJson()));

    // It might be important to construct this _after_ the DB is set up
    // in case there are bits in the constructor that care about the state
    // of the database.
    todoController = new TodoController(db);
  }

  // http://stackoverflow.com/questions/34436952/json-parse-equivalent-in-mongo-driver-3-x-for-java
  private BsonArray parseJsonArray(String json) {
    final CodecRegistry codecRegistry
      = CodecRegistries.fromProviders(Arrays.asList(
      new ValueCodecProvider(),
      new BsonValueCodecProvider(),
      new DocumentCodecProvider()));

    JsonReader reader = new JsonReader(json);
    BsonArrayCodec arrayReader = new BsonArrayCodec(codecRegistry);

    return arrayReader.decode(reader, DecoderContext.builder().build());
  }

  private static String getStatus(BsonValue val) {
    BsonDocument doc = val.asDocument();
    return ((BsonString) doc.get("status")).getValue();
  }

  private static String getBody(BsonValue val) {
    BsonDocument doc = val.asDocument();
    return ((BsonString) doc.get("body")).getValue();
  }

  private static String getCategory(BsonValue val) {
    BsonDocument doc = val.asDocument();
    return ((BsonString) doc.get("category")).getValue();
  }

  private static String getOwner(BsonValue val) {
    BsonDocument doc = val.asDocument();
    return ((BsonString) doc.get("owner")).getValue();
  }

  @Test
  public void getAllTodos() {
    Map<String, String[]> emptyMap = new HashMap<>();
    String jsonResult = todoController.getTodos(emptyMap);
    BsonArray docs = parseJsonArray(jsonResult);

    assertEquals("Should be 4 todos", 4, docs.size());
    List<String> names = docs
      .stream()
      .map(TodoControllerSpec::getOwner)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedNames = Arrays.asList("Chris", "Jamie", "Pat", "Sam");
    assertEquals("Names should match", expectedNames, names);
  }

  @Test
  public void getTodosThatAreComplete() {
    Map<String, String[]> argMap = new HashMap<>();
    argMap.put("status", new String[]{"true"});
    String jsonResult = todoController.getTodos(argMap);
    BsonArray docs = parseJsonArray(jsonResult);

    assertEquals("Should be 2 todos", 2, docs.size());
    List<String> names = docs
      .stream()
      .map(TodoControllerSpec::getOwner)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedNames = Arrays.asList("Chris", "Jamie");
    assertEquals("Names should match", expectedNames, names);
  }

  @Test
  public void getSamById() {
    String jsonResult = todoController.getTodo(samsId.toHexString());
    Document sam = Document.parse(jsonResult);
    assertEquals("Name should match", "Sam", sam.get("owner"));
    String noJsonResult = todoController.getTodo(new ObjectId().toString());
    assertNull("No name should match", noJsonResult);

  }

  @Test
  public void addTodoTest() {
    String newId = todoController.addNewTodo("Brian", "complete", "umm", "brian@yahoo.com");

    assertNotNull("Add new todo should return true when todo is added,", newId);
    Map<String, String[]> argMap = new HashMap<>();
    argMap.put("status", new String[]{"true"});
    String jsonResult = todoController.getTodos(argMap);
    BsonArray docs = parseJsonArray(jsonResult);

    List<String> name = docs
      .stream()
      .map(TodoControllerSpec::getOwner)
      .sorted()
      .collect(Collectors.toList());
    assertEquals("Should return name of new todo", "Brian", name.get(0));
  }

  @Test
  public void getTodoByCategory() {
    Map<String, String[]> argMap = new HashMap<>();
    //Mongo in TodoController is doing a regex search so can just take a Java Reg. Expression
    //This will search the company starting with an I or an F
    argMap.put("category", new String[]{"[S]"});
    System.out.println(argMap);
    String jsonResult = todoController.getTodos(argMap);
    System.out.println(jsonResult);
    BsonArray docs = parseJsonArray(jsonResult);
    System.out.println(docs);
    assertEquals("Should be 3 todos", 3, docs.size());
    List<String> name = docs
      .stream()
      .map(TodoControllerSpec::getOwner)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedName = Arrays.asList("Jamie", "Pat", "Sam");
    assertEquals("Names should match", expectedName, name);

  }

  @Test
  public void getTodoByCategory2() {
    Map<String, String[]> argMap = new HashMap<>();
    String[] query = {"[P, G]"};
    argMap.put("category", query);
    System.out.println(argMap);
    String jsonResult = todoController.getTodos(argMap);
    System.out.println(jsonResult);
    BsonArray docs = parseJsonArray(jsonResult);
    System.out.println(docs);

  }

}
