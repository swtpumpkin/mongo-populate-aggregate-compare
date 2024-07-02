# MongoDB Populate Aggregate Compare Test

## Running script

1. Install dependencies

```bash
npm install
```

2. Run script

```bash
npm run start
```

## Sample output

```log
Testing with 10 documents...
Testing populate with 10 documents...
populate with 10 documents: 12.616999864578247 ms
Testing aggregate with 10 documents...
aggregate with 10 documents: 3.547708034515381 ms
aggregate is faster for 10 documents.
Testing with 500000 documents...
Testing populate with 500000 documents...
populate with 500000 documents: 6424.865000009537 ms
Testing aggregate with 500000 documents...
aggregate with 500000 documents: 10192.34625005722 ms
populate is faster for 500000 documents.
```
