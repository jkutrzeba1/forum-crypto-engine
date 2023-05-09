// Find all our documentation at https://docs.near.org
import { NearBindgen, near, call, view, Vector, initialize, bytes } from 'near-sdk-js';

class Post{
  constructor(author: string, content: string){
    this.author = author;
    this.content = content;
    this.next = -1;
  }

  author: string;
  content: string;
  next: number;

}

class Topic{
  constructor(author: string, title: string, postid: number){
    this.author = author;
    this.title = title;
    this.beg = postid;
    this.end = postid;
    this.next = -1;
    this.postsCnt = 1;
  }

  author: string;
  title: string;
  catid: number;
  beg: number;
  end: number;
  next: number;
  postsCnt: number;
}

class Category{

  constructor(){
    this.beg = -1;
    this.end = -1;
    this.topicsCnt = 0;
  }

  beg: number;
  end: number;
  topicsCnt: number;

}

class User{
  
}

@NearBindgen({})
class NearForum {

  categoriestree: Object = {

    idcnt: 0,

    childs: [
    ]

  };

  posts: Vector<Post> = new Vector<Post>("p");
  topics: Vector<Topic> = new Vector<Topic>("t");
  users: Vector<User> = new Vector<User>("u");
  admins: Vector<string> = new Vector<string>("a");
  categories: Vector<Category> = new Vector<Category>("c");

  @initialize({})
  init({adminId}:{adminId:string}){

    this.admins.push(adminId);
    this.categories.push( new Category() );

  }

  @view({})
  getCost({bytes}:{bytes:number}){

    let bn = BigInt(BigInt(bytes) * near.storageByteCost());

    return bn.toString();
  }

  @view({})
  getMeta({adminId}:{adminId: string}){

    let idx = this.admins.toArray().indexOf(adminId);

    return {
      cattree: this.categoriestree,
      idx: idx
    }
  }

  @view({})
  catMeta({catidx}:{catidx:number}){

    let category = this.categories.get(catidx);
    if(category==null) throw new Error("NOT FOUND");

    return {
      totalPages: category.topicsCnt
    }

  }

  @view({})
  topicMeta({topicidx}:{topicidx:number}){

    let topic = this.topics.get(topicidx);
    if(topic==null) throw new Error("TOPIC NOT FOUND");

    return {
      postsTotal: topic.postsCnt
    }

  }

  @call({payableFunction: true})
  addPost({topicidx, content}:{topicidx: number, content: string}){

    let caller = near.predecessorAccountId();

    let topic = this.topics.get(topicidx);
    if(topic==null){
      throw new Error("TOPIC NOT FOUND");
    }

    let bytesInitial = near.storageUsage();

    let prevPost = this.posts.get(topic.end);
    prevPost.next =this.posts.length;
    this.posts.replace(topic.end, prevPost);

    topic.end = this.posts.length;
    topic.postsCnt++;
    this.topics.replace(topicidx, topic);

    this.posts.push(new Post(caller, content));

    let bytesUsed = BigInt(near.storageUsage() - bytesInitial);

    if(BigInt(bytesUsed * near.storageByteCost())>near.attachedDeposit()){
      throw new Error("UNSUFICENT DEPOSIT ATTACHED " + bytesUsed);
    }

  }

  @call({payableFunction: true})
  addTopic({catidx, title, content} : {catidx: number, title: string, content: string}){

    let caller = near.predecessorAccountId();

    let storagebn = BigInt(BigInt(caller.length*2 + content.length + title.length + 40)*near.storageByteCost());
    if(storagebn>near.attachedDeposit()){
      throw new Error("STORAGE FEE UNSUFICINET");
    }

    let category = this.categories.get(catidx);
    if(category == null){
      throw new Error("CATEGORY NOT FOUND");
    }

    let bytesInitial = near.storageUsage();

    if(category.beg == -1 ){
      category.beg = this.topics.length;
      category.end = this.topics.length;
    }
    else{

      let prevTopic = this.topics.get(category.end);
      prevTopic.next = this.topics.length;

      this.topics.replace(category.end, prevTopic);

      category.end = this.topics.length;

    }

    category.topicsCnt++;

    this.categories.replace(catidx, category);

    this.topics.push( new Topic(caller, title, this.posts.length ));
    this.posts.push( new Post(caller, content) );

    let bytesUsed = BigInt(near.storageUsage()-bytesInitial);

    if(BigInt(bytesUsed * near.storageByteCost())>near.attachedDeposit()){
      throw new Error("UNSUFICIENT DEPOSIT ATTACHED " + bytesUsed);
    }

  }

  @view({})
  getTopics({catidx, prevtopicidx}:{catidx: number, prevtopicidx: number}){

    let topicidx;

    if(typeof prevtopicidx == "number"){
      let prevTopic = this.topics.get(prevtopicidx);
      topicidx = prevTopic.next;
    }
    else{
      let category = this.categories.get(catidx);
      if(category==null){
        throw new Error("CATEGORY NOT FOUND");
      }

      topicidx = category.beg;

    }

    let topicsOut = [];

    while(topicidx != -1 && topicsOut.length<20){

      let topic = this.topics.get(topicidx);

      topicsOut.push({
        author: topic.author,
        title: topic.title,
        topicidx: topicidx
      })

      topicidx = topic.next;
    }

    return topicsOut;
  }

  @view({})
  getPosts({topicidx, nextpostidx} : {topicidx: number, nextpostidx: number}){

    let postidx;

    if(typeof nextpostidx == "number"){

      postidx = nextpostidx

    }
    else{
      let topic = this.topics.get(topicidx);
      if(topic==null){
        throw new Error("TOPIC NOT FOUND");
      }
      postidx = topic.beg;
    }

    let postsOut = [];

    while(true){

      let post = this.posts.get(postidx);

      postsOut.push({
        author: post.author,
        content: post.content
      });

      if(post.next == -1 || postsOut.length==20){

        postsOut[postsOut.length-1].next = post.next;

        break;
      }

      postidx = post.next;

    }

    return postsOut;
  }

  @call({payableFunction: true})
  addCategory({treesnap, adminidx, newCatsCnt} : {treesnap:Object, adminidx : number, newCatsCnt: number}){

    let caller = near.predecessorAccountId();
    let deposit = near.attachedDeposit();

    let bytesUsed = JSON.stringify(treesnap).length - JSON.stringify(this.categoriestree).length;
    if(bytesUsed<0) bytesUsed = 0;

    bytesUsed += newCatsCnt * 20;

    if(deposit<BigInt(BigInt(bytesUsed) * near.storageByteCost())){
      throw new Error("DEPOSIT DEFICYT " + bytesUsed + " BYTES USED");
    }
    

    let admin = this.admins.get(adminidx);
    if(admin == null){
      throw new Error("NOT ADMIN");
    }

    if(admin!=caller){
      throw new Error("NOT ADMIN");
    }

    for(let i = 0; i<newCatsCnt; i++){
      this.categories.push( new Category() );
    }

    this.categoriestree = treesnap;

  }


}