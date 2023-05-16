// Find all our documentation at https://docs.near.org
import { NearBindgen, near, call, view, Vector, initialize, bytes } from 'near-sdk-js';

class Post{
  constructor(author: string, content: string, prev: number){
    this.author = author;
    this.content = content;
    this.next = -1;
    this.prev = prev;
    this.deleted = false;
  }

  author: string;
  content: string;
  next: number;
  prev: number;
  deleted: boolean;
}

class Topic{
  constructor(author: string, title: string, postid: number, next: number, catidx: number){
    this.author = author;
    this.title = title;
    this.beg = postid;
    this.end = postid;
    this.next = next;
    this.prev = -1;
    this.postsCnt = 1;
    this.catidx = catidx;
  }

  author: string;
  title: string;
  catid: number;
  beg: number;
  end: number;
  next: number;
  prev: number;
  postsCnt: number;
  catidx: number;
}

class Category{

  constructor(){
    this.beg = -1;
    this.topicsCnt = 0;
  }

  beg: number;
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

  @call({payableFunction: true})
  reset(){

    let caller = near.predecessorAccountId();

    let idx = this.admins.toArray().indexOf(caller);
    if(idx==-1){
      throw new Error("NOT ADMIN");
    }

    this.posts.clear();
    this.topics.clear();
    this.users.clear();
    this.categories.clear();

    this.categoriestree = {
      idcnt: 0,
      childs: []
    }

  }

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

    let lastPostIdx = topic.end;

    let prevPost = this.posts.get(topic.end);
    prevPost.next =this.posts.length;
    this.posts.replace(topic.end, prevPost);

    topic.end = this.posts.length;
    topic.postsCnt++;

    let category = this.categories.get(topic.catidx);
    if(category==null){
      throw new Error("INVALID");
    }

    if(topic.prev!=-1){
      let topicPrev = this.topics.get(topic.prev);
      topicPrev.next = topic.next;
      this.topics.replace(topic.prev, topicPrev);
    }
    if(topic.next!=-1){
      let topicNext = this.topics.get(topic.next);
      topicNext.prev = topic.prev;
      this.topics.replace(topic.next, topicNext);
    }
    
    if(category.beg!=topicidx){
      topic.next = category.beg;
      category.beg = topicidx;
    }

    this.categories.replace(topic.catidx, category);
    this.topics.replace(topicidx, topic);

    this.posts.push(new Post(caller, content, lastPostIdx));

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

    let topicAtTopIdx = category.beg;

    if(topicAtTopIdx!=-1){

      let topicAtTop = this.topics.get(topicAtTopIdx);
      topicAtTop.prev = this.topics.length;

      this.topics.replace(topicAtTopIdx, topicAtTop);

    }

    category.beg = this.topics.length;

    category.topicsCnt++;

    this.categories.replace(catidx, category);

    this.topics.push( new Topic(caller, title, this.posts.length, topicAtTopIdx, catidx ));
    this.posts.push( new Post(caller, content, -1) );

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

  @call({payableFunction:true})
  editPost({postShift, idx, isTopicIdx = true, content }:{postShift:number, idx: number, isTopicIdx: boolean, content: string}){

    let caller = near.predecessorAccountId();

    let adminidx = this.admins.toArray().indexOf(caller);
    if(adminidx==-1){
      throw new Error("NOT ADMIN");
    }

    let firstPostIdx;

    if(isTopicIdx == false){
      firstPostIdx = idx;
    }
    else{

      let topic = this.topics.get(idx);
      if(topic==null){
        throw new Error("INVALID");
      }

      firstPostIdx = topic.beg;

    }

    let postIdx = firstPostIdx;
    let post;

    for(let i = 0; i<postShift-1; i++){

      post = this.posts.get(postIdx);
      postIdx = post.next;

    }

    let bytes = near.storageUsage();

    post = this.posts.get(postIdx);

    post.content = content;

    this.posts.replace(postIdx, post);


    return BigInt(near.storageUsage()-bytes).toString();

  }

  @call({payableFunction: true})
  deletePost({postShift, idx, isTopicIdx = true }:{postShift:number, idx: number, isTopicIdx: boolean}){

    let caller = near.predecessorAccountId();

    let adminidx = this.admins.toArray().indexOf(caller);
    if(adminidx==-1){
      throw new Error("NOT ADMIN");
    }

    if(isTopicIdx==true && idx==1){
      throw new Error("TOPIC");
    }

    let firstPostIdx;

    if(isTopicIdx == false){
      firstPostIdx = idx;
    }
    else{

      let topic = this.topics.get(idx);
      if(topic==null){
        throw new Error("INVALID");
      }

      firstPostIdx = topic.beg;

    }

    let postIdx = firstPostIdx;
    let post;

    for(let i = 0; i<postShift-1; i++){

      post = this.posts.get(postIdx);
      postIdx = post.next;

    }

    post = this.posts.get(postIdx);

    post.deleted = true;
    this.posts.replace(postIdx, post);

    if(post.next!=-1){

      let postNext = this.posts.get(post.next);
      postNext.prev = post.prev;
      this.posts.replace(post.next, postNext);

    }
    if(post.prev!=-1){

      let postPrev = this.posts.get(post.prev);
      postPrev.next = post.next;
      this.posts.replace(post.prev, postPrev);

    }


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