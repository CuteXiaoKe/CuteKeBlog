package com.cuteke.spring.boot.blog.service;

import javax.transaction.Transactional;

import com.cuteke.spring.boot.blog.domain.Catalog;
import org.elasticsearch.common.recycler.Recycler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.cuteke.spring.boot.blog.domain.Blog;
import com.cuteke.spring.boot.blog.domain.Comment;
import com.cuteke.spring.boot.blog.domain.User;
import com.cuteke.spring.boot.blog.domain.Vote;
import com.cuteke.spring.boot.blog.domain.es.EsBlog;
import com.cuteke.spring.boot.blog.repository.BlogRepository;

import java.util.*;

/**
 * Blog 服务.
 * 
 * @since 1.0.0 2017年4月7日
 * @author <a href="http://www.cuteke.cm">CuteKe</a>
 */
@Service
public class BlogServiceImpl implements BlogService {

	@Autowired
	private EsBlogService esBlogService;
	
	@Autowired
	private BlogRepository blogRepository;
	
	@Autowired
	private CommentService commentService;
	
	@Autowired
	private VoteService voteService;
 
	@Transactional
	@Override
	public Blog saveBlog(Blog blog) {
		boolean isNew = (blog.getId() == null);
	    EsBlog esBlog = null;

	    Blog returnBlog = blogRepository.save(blog);

	    if (isNew) {
	        esBlog = new EsBlog(returnBlog);
	    } else {
	        esBlog = esBlogService.getEsBlogByBlogId(blog.getId());
	        esBlog.update(returnBlog);
	    }

	    esBlogService.updateEsBlog(esBlog);
	    return returnBlog;
	}

	@Transactional
	@Override
	public void removeBlog(Long id) {
		blogRepository.delete(id);
	    EsBlog esblog = esBlogService.getEsBlogByBlogId(id);
	    esBlogService.removeEsBlog(esblog.getId());
	}

	@Override
	public Blog getBlogById(Long id) {
		return blogRepository.findOne(id);
	}

	@Override
	public Page<Blog> listBlogsByTitleVote(User user, String title, Pageable pageable) {
		// 模糊查询
		title = "%" + title + "%";
		String tags = title;
		Page<Blog> blogs = blogRepository.findByTitleLikeAndUserOrTagsLikeAndUserOrderByPriorityDescCreateTimeDesc(title,user, tags,user, pageable);
		return blogs;
	}

	@Override
	public Page<Blog> listBlogsByTitleVoteAndSort(User user, String title, Pageable pageable) {
		// 模糊查询
		title = "%" + title + "%";
		Page<Blog> blogs = blogRepository.findByUserAndTitleLike(user, title, pageable);
		return blogs;
	}

	@Override
	public void readingIncrease(Long id) {
		Blog blog = blogRepository.findOne(id);
		blog.setReadSize(blog.getReadSize()+1); // 在原有的阅读量基础上递增1
		this.saveBlog(blog);
	}

	@Override
	public Blog createComment(Long blogId, String commentContent) {
	    Blog originalBlog = blogRepository.findOne(blogId);
	    User user = (User)SecurityContextHolder.getContext().getAuthentication().getPrincipal(); 
	    Comment comment = new Comment(user, commentContent);
	    originalBlog.addComment(comment);
	    return this.saveBlog(originalBlog);
	}

	@Override
	public void removeComment(Long blogId, Long commentId) {
	    Blog originalBlog = blogRepository.findOne(blogId);
	    originalBlog.removeComment(commentId);
	    this.saveBlog(originalBlog);
	}

	@Override
	public Blog createVote(Long blogId) {
	    Blog originalBlog = blogRepository.findOne(blogId);
	    User user = (User)SecurityContextHolder.getContext().getAuthentication().getPrincipal(); 
	    Vote vote = new Vote(user);
	    boolean isExist = originalBlog.addVote(vote);
	    if (isExist) {
	        throw new IllegalArgumentException("您已经点过赞了哟~");
	    }
	    return this.saveBlog(originalBlog);
	}

	@Override
	public void removeVote(Long blogId, Long voteId) {
	    Blog originalBlog = blogRepository.findOne(blogId);
	    originalBlog.removeVote(voteId);
	    this.saveBlog(originalBlog);
	}

	@Override
	public Page<Blog> listBlogsByCatalog(Catalog catalog, Pageable pageable) {
		Page<Blog> blogs = blogRepository.findByCatalog(catalog, pageable);
	    return blogs;
	}

	@Override
	public List<Blog> listBlogs(Catalog catalog) {
		return blogRepository.findByCatalog(catalog);
	}

	@Override
	public void removeComment(Long commentId) {
		Comment comment=commentService.getCommentById(commentId);
		List<Comment> comments=new ArrayList<>();
		comments.add(comment);
		List<Blog> blogs=blogRepository.findByComments(comments);
		for(Blog blog:blogs){
			this.removeComment(blog.getId(),commentId);
		}
	}

	@Override
	public void removeVote(Long voteId) {
		Vote vote=voteService.getVoteById(voteId);
		List<Vote> votes=new ArrayList<>();
		votes.add(vote);
		List<Blog> blogs=blogRepository.findByVotes(votes);
		for(Blog blog:blogs){
			this.removeVote(blog.getId(),voteId);
		}
	}

	@Override
	public Page<Blog> listBlogsByTitle(String title, Pageable pageable) {
		title="%" + title + "%";
		return blogRepository.findByTitleLike(title,pageable);
	}

	@Override
	public void refreshES() {
		esBlogService.removeAllEsBlog();
		String title="%%";
		List<Blog> blogs=blogRepository.findByTitleLike(title);
		for(Blog blog:blogs){
			EsBlog esBlog = new EsBlog(blog);
			esBlogService.updateEsBlog(esBlog);
		}
	}
}
