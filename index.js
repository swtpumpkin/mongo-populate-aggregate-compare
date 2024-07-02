const mongoose = require("mongoose");
const { Schema } = mongoose;
const { performance } = require("perf_hooks");

// Mongoose 모델 정의
const authorSchema = new Schema({ name: String });
const bookSchema = new Schema({
  title: String,
  author: { type: Schema.Types.ObjectId, ref: "Author" },
});

const Author = mongoose.model("Author", authorSchema);
const Book = mongoose.model("Book", bookSchema);

// 데이터베이스 연결
mongoose.connect("mongodb://localhost:27017/testdb");

// 테스트 데이터 생성
async function createTestData(numAuthors, numBooks) {
  await Author.deleteMany({});
  await Book.deleteMany({});

  const authors = [];
  for (let i = 0; i < numAuthors; i++) {
    authors.push(new Author({ name: `Author ${i}` }));
  }
  await Author.insertMany(authors);

  const books = [];
  for (let i = 0; i < numBooks; i++) {
    const author = authors[i % numAuthors];
    books.push(new Book({ title: `Book ${i}`, author: author._id }));
  }
  await Book.insertMany(books);
}

// 성능 테스트 함수
async function testPerformance() {
  const smallTestSize = 10;
  const largeTestSize = 500000;

  // Small test
  console.log(`Testing with ${smallTestSize} documents...`);

  await createTestData(smallTestSize / 2, smallTestSize);

  console.log(`Testing populate with ${smallTestSize} documents...`);
  let startTime = performance.now();
  await Book.find().populate("author").exec();
  let endTime = performance.now();
  const populateSmallTime = endTime - startTime;
  console.log(
    `populate with ${smallTestSize} documents: ${populateSmallTime} ms`
  );

  await createTestData(smallTestSize / 2, smallTestSize);

  console.log(`Testing aggregate with ${smallTestSize} documents...`);
  startTime = performance.now();
  await Book.aggregate([
    {
      $lookup: {
        from: "authors",
        localField: "author",
        foreignField: "_id",
        as: "authorDetails",
      },
    },
    {
      $unwind: "$authorDetails",
    },
  ]).exec();
  endTime = performance.now();
  const aggregateSmallTime = endTime - startTime;
  console.log(
    `aggregate with ${smallTestSize} documents: ${aggregateSmallTime} ms`
  );

  if (populateSmallTime < aggregateSmallTime) {
    console.log(`populate is faster for ${smallTestSize} documents.`);
  } else {
    console.log(`aggregate is faster for ${smallTestSize} documents.`);
  }

  // Large test
  console.log(`Testing with ${largeTestSize} documents...`);

  await createTestData(largeTestSize / 2, largeTestSize);

  console.log(`Testing populate with ${largeTestSize} documents...`);
  startTime = performance.now();
  await Book.find().populate("author").exec();
  endTime = performance.now();
  const populateLargeTime = endTime - startTime;
  console.log(
    `populate with ${largeTestSize} documents: ${populateLargeTime} ms`
  );

  await createTestData(largeTestSize / 2, largeTestSize);

  console.log(`Testing aggregate with ${largeTestSize} documents...`);
  startTime = performance.now();
  await Book.aggregate([
    {
      $lookup: {
        from: "authors",
        localField: "author",
        foreignField: "_id",
        as: "authorDetails",
      },
    },
    {
      $unwind: "$authorDetails",
    },
  ]).exec();
  endTime = performance.now();
  const aggregateLargeTime = endTime - startTime;
  console.log(
    `aggregate with ${largeTestSize} documents: ${aggregateLargeTime} ms`
  );

  if (populateLargeTime < aggregateLargeTime) {
    console.log(`populate is faster for ${largeTestSize} documents.`);
  } else {
    console.log(`aggregate is faster for ${largeTestSize} documents.`);
  }

  mongoose.connection.close();
}

// 테스트 실행
testPerformance().catch((err) => console.error(err));
