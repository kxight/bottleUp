// base - Diary.find()
// base - Diary.find(email: {"test@email.com"},)

// bigQ - //search=coder&page=2&mood=happy&rating[gte]=4&price[lte]=999&price[gte]=199&limit=5

class WhereClause {
  constructor(base, bigQ) {
    this.base = base;
    this.bigQ = bigQ;
  }

  search() {
    const searchword = this.bigQ.search
      ? {
          content: {
            $regex: this.bigQ.search,
            $options: "i",
          },
        }
      : {};

    // console.log(searchword)
    this.base = this.base.find({ ...searchword });
    return this;
  }

  filter() {
    const copyQ = { ...this.bigQ };

    delete copyQ["search"];
    delete copyQ["limit"];
    delete copyQ["page"];

    // convert bigQ into a string => copyQ
    let stringOfCopyQ = JSON.stringify(copyQ);

    stringOfCopyQ = stringOfCopyQ.replace(/\b(gte|lte|gt|lt|ne)\b/g, (m) => `$${m}`);

    const jsonOfCopyQ = JSON.parse(stringOfCopyQ);
    // console.log(jsonOfCopyQ)

    this.base = this.base.find(jsonOfCopyQ);
    return this
  }

  pager(resultperPage) {
    let currentPage = 1;
    if (this.bigQ.page) {
      currentPage = this.bigQ.page;
    }

    const skipVal = resultperPage * (currentPage - 1);

    this.base = this.base.limit(resultperPage).skip(skipVal);
    return this;
  }
}

module.exports = WhereClause;

