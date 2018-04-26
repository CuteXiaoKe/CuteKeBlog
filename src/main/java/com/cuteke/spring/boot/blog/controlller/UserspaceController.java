package com.cuteke.spring.boot.blog.controlller;

import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import javax.servlet.http.HttpServletRequest;
import javax.swing.text.html.HTMLDocument;
import javax.validation.ConstraintViolationException;

import com.cuteke.spring.boot.blog.config.CustomPasswordEncoder;
import com.cuteke.spring.boot.blog.domain.Blog;
import com.cuteke.spring.boot.blog.domain.Catalog;
import com.cuteke.spring.boot.blog.domain.User;
import com.cuteke.spring.boot.blog.service.BlogService;
import com.cuteke.spring.boot.blog.service.CatalogService;
import com.cuteke.spring.boot.blog.service.UserService;
import com.cuteke.spring.boot.blog.util.IpUtil;
import com.cuteke.spring.boot.blog.vo.BlogIPVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.ModelAndView;

import com.cuteke.spring.boot.blog.domain.Vote;
import com.cuteke.spring.boot.blog.util.ConstraintViolationExceptionHandler;
import com.cuteke.spring.boot.blog.vo.Response;
import org.thymeleaf.util.DateUtils;

/**
 * 用户主页控制器.
 * 
 * @since 1.0.0 2017年5月28日
 * @author <a href="http://www.cuteke.com">CuteKe</a> 
 */
@Controller
@RequestMapping("/u")
public class UserspaceController {

	@Autowired
	private UserService userService;
	
	@Autowired
	private BlogService blogService;
	
	@Autowired
	private UserDetailsService userDetailsService;
	
	@Autowired
	private CatalogService catalogService;
	
	@Value("${file.server.url}")
	private String fileServerUrl;
	
	//记录当前时间，防止用户多次提交暴涨访问量 单例模式 共享变量
	private Date currentDate=new Date();
	
	//记录每个ip的每天的访问量，第二天清空 单例模式 共享变量
	private ConcurrentMap<BlogIPVO, Integer> ipMapsCounts = new ConcurrentHashMap<>();

	@Value(("${blog.readingMax.perday}"))
	private Integer readingMax;
	
	
	
    /**
     * 用户的主页
     * @param username
     * @param model
     * @return
     */
    @GetMapping("/{username}")
    public String userSpace(@PathVariable("username") String username, Model model) {
        User user = (User)userDetailsService.loadUserByUsername(username);
        model.addAttribute("user", user);
		try{
			username = java.net.URLEncoder.encode(username,"UTF-8");
		}catch(Exception ex){
			ex.printStackTrace();
		}
		String result="redirect:/u/" + username + "/blogs";
		return result;
    }

	
	/**
	 * 获取个人设置页面
	 * @param username
	 * @param model
	 * @return
	 */
	@GetMapping("/{username}/profile")
	@PreAuthorize("authentication.name.equals(#username)") 
	public ModelAndView profile(@PathVariable("username") String username, Model model) {
	    User  user = (User)userDetailsService.loadUserByUsername(username);
	    model.addAttribute("user", user);
	    model.addAttribute("fileServerUrl", fileServerUrl);// 文件服务器的地址返回给客户端
	    return new ModelAndView("/userspace/profile", "userModel", model);
	}

	/**
	 * 保存个人设置
	 * @param username
	 * @param user
	 * @return
	 */
	@PostMapping("/{username}/profile")
	@PreAuthorize("authentication.name.equals(#username)") 
	public ResponseEntity<Response> saveProfile(@PathVariable("username") String username,User user) {
	    try {
			userService.saveOrUpdateUserWithProfile(user);
		}catch (ConstraintViolationException e)  {
			return ResponseEntity.ok().body(new Response(false, ConstraintViolationExceptionHandler.getMessage(e)));
		} catch (Exception e) {
			return ResponseEntity.ok().body(new Response(false, e.getMessage()));
		}
		return ResponseEntity.ok().body(new Response(true, "修改成功", null));
	}

	/**
	 * 获取编辑头像的界面
	 * @param username
	 * @param model
	 * @return
	 */
	@GetMapping("/{username}/avatar")
	@PreAuthorize("authentication.name.equals(#username)") 
	public ModelAndView avatar(@PathVariable("username") String username, Model model) {
	    User  user = (User)userDetailsService.loadUserByUsername(username);
	    model.addAttribute("user", user);
	    return new ModelAndView("/userspace/avatar", "userModel", model);
	}

	/**
	 * 保存头像
	 * @param username
	 * @param user
	 * @return
	 */
	@PostMapping("/{username}/avatar")
	@PreAuthorize("authentication.name.equals(#username)") 
	public ResponseEntity<Response> saveAvatar(@PathVariable("username") String username, @RequestBody User user) {
	    String avatarUrl = user.getAvatar();

	    User originalUser = userService.getUserById(user.getId());
	    originalUser.setAvatar(avatarUrl);
	    userService.saveOrUpdateUserWithoutException(originalUser);

	    return ResponseEntity.ok().body(new Response(true, "保存头像成功", avatarUrl));
	}
	  /**
     * 获取用户的博客列表
     * @param username
     * @param order
     * @param catalogId
     * @param keyword
     * @param async
     * @param pageIndex
     * @param pageSize
     * @param model
     * @return
     */
	@GetMapping("/{username}/blogs")
	public String listBlogsByOrder(@PathVariable("username") String username,
			@RequestParam(value="order",required=false,defaultValue="new") String order,
			@RequestParam(value="catalog",required=false ) Long catalogId,
			@RequestParam(value="keyword",required=false,defaultValue="" ) String keyword,
			@RequestParam(value="async",required=false) boolean async,
			@RequestParam(value="pageIndex",required=false,defaultValue="0") int pageIndex,
			@RequestParam(value="pageSize",required=false,defaultValue="10") int pageSize,
			Model model) {
		
		User  user = (User)userDetailsService.loadUserByUsername(username);

		;

		// 判断操作用户是否是访客
		boolean isOwner = false;

		if (SecurityContextHolder.getContext().getAuthentication() !=null && SecurityContextHolder.getContext().getAuthentication().isAuthenticated()
				&&  !SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString().equals("anonymousUser")) {
			User principal = (User)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
			if (principal !=null && user.getUsername().equals(principal.getUsername())) {
				isOwner = true;
			}
		}
		Page<Blog> page = null;
		
		 if (catalogId != null && catalogId > 0) { // 分类查询
	        Catalog catalog = catalogService.getCatalogById(catalogId);
	        Pageable pageable = new PageRequest(pageIndex, pageSize);
	        page = blogService.listBlogsByCatalog(catalog, pageable);
	        order = "";
		}  else if (order.equals("hot")) { // 最热查询
			Sort sort = new Sort(Direction.DESC,"priority","readSize","commentSize","voteSize"); 
			Pageable pageable = new PageRequest(pageIndex, pageSize, sort);
			page = blogService.listBlogsByTitleVoteAndSort(user, keyword, pageable);
		} else if (order.equals("new")) { // 最新查询
		//	 Sort sort = new Sort(Direction.DESC,"priority","createTime");
			Pageable pageable = new PageRequest(pageIndex, pageSize);
			page = blogService.listBlogsByTitleVote(user, keyword, pageable);
		}
 
		
		List<Blog> list = page.getContent();	// 当前所在页面数据列表
		
		model.addAttribute("user", user);
		model.addAttribute("order", order);
		model.addAttribute("catalogId", catalogId);
		model.addAttribute("keyword", keyword);
		model.addAttribute("page", page);
		model.addAttribute("blogList", list);
		model.addAttribute("isOwner",isOwner);
		return (async==true?"/userspace/u :: #mainContainerRepleace":"/userspace/u");
		
	}

	/**
	 * 获取博客展示界面
	 * @param username
	 * @param id
	 * @param model
	 * @return
	 */
	@GetMapping("/{username}/blogs/{id}")
	public String getBlogById(@PathVariable("username") String username,@PathVariable("id") Long id, Model model) {
		User principal = null;
		Blog blog = blogService.getBlogById(id);
		
		// 每次读取，简单的可以认为阅读量增加1次
		if(readingIsMax(id))
			blogService.readingIncrease(id);

		// 判断操作用户是否是博客的所有者
		boolean isBlogOwner = false;
		if (SecurityContextHolder.getContext().getAuthentication() !=null && SecurityContextHolder.getContext().getAuthentication().isAuthenticated()
				 &&  !SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString().equals("anonymousUser")) {
			principal = (User)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
			if (principal !=null && username.equals(principal.getUsername())) {
				isBlogOwner = true;
			} 
			Iterator iterator=principal.getAuthorities().iterator();
			if(iterator.hasNext()){
				String role=iterator.next().toString();
				if(role.equals("ROLE_ADMIN"))
					isBlogOwner=true;
			}
		}
 
	    // 判断操作用户的点赞情况
	    List<Vote> votes = blog.getVotes();
	    Vote currentVote = null; // 当前用户的点赞情况

		if(principal!=null){
			Iterator<Vote> voteIterator=votes.iterator();
			while(voteIterator.hasNext()){
				Vote vote=voteIterator.next();
				if(vote.getUser().getName().equals(principal.getName()))
					currentVote=vote;
			}
		}
		
//	    if (principal !=null) {  不能这要写，因为延迟加载
//	        for (Vote vote : votes) {
//	            if(vote.getUser().getName().equals(principal.getName()))
//	                 currentVote = vote;
//	            break;
//	        }
//	    }

	    model.addAttribute("currentVote",currentVote);  
		model.addAttribute("isBlogOwner", isBlogOwner);
		model.addAttribute("blogModel",blog);
		
		return "/userspace/blog";
	}
	
	
	/**
	 * 获取新增博客的界面
	 * @param model
	 * @return
	 */
	@GetMapping("/{username}/blogs/edit")
	@PreAuthorize("authentication.name.equals(#username)")
	public ModelAndView createBlog(@PathVariable("username") String username, Model model) {
		// 获取用户分类列表
		User user = (User)userDetailsService.loadUserByUsername(username);
		List<Catalog> catalogs = catalogService.listCatalogs(user);

	    model.addAttribute("catalogs", catalogs);
		model.addAttribute("blog", new Blog(null, null, null));
		model.addAttribute("fileServerUrl", fileServerUrl);// 文件服务器的地址返回给客户端
		return new ModelAndView("/userspace/blogedit", "blogModel", model);
	}
	
	/**
	 * 获取编辑博客的界面
	 * @param model
	 * @return
	 */
	@GetMapping("/{username}/blogs/edit/{id}")
	@PreAuthorize("authentication.name.equals(#username) or hasAnyAuthority('ROLE_ADMIN')")
	public ModelAndView editBlog(@PathVariable("username") String username, @PathVariable("id") Long id, Model model) {
		// 获取用户分类列表
		User user = (User)userDetailsService.loadUserByUsername(username);
		List<Catalog> catalogs = catalogService.listCatalogs(user);

	    model.addAttribute("catalogs", catalogs);
		model.addAttribute("blog", blogService.getBlogById(id));
		model.addAttribute("fileServerUrl", fileServerUrl);// 文件服务器的地址返回给客户端
		return new ModelAndView("/userspace/blogedit", "blogModel", model);
	}
	
	/**
	 * 保存博客
	 * @param username
	 * @param blog
	 * @return
	 */
	@PostMapping("/{username}/blogs/edit")
	@PreAuthorize("authentication.name.equals(#username) or hasAnyAuthority('ROLE_ADMIN')") 
	public ResponseEntity<Response> saveBlog(@PathVariable("username") String username, @RequestBody Blog blog) {
		// 对 Catalog 进行空处理
		if (blog.getCatalog().getId() == null) {
			return ResponseEntity.ok().body(new Response(false,"未选择分类"));
		}
		
		try {

			// 判断是修改还是新增	
			if (blog.getId()!=null) {
				Blog orignalBlog = blogService.getBlogById(blog.getId());
				orignalBlog.setTitle(blog.getTitle());
				orignalBlog.setContent(blog.getContent());
				orignalBlog.setSummary(blog.getSummary());
				orignalBlog.setCatalog(blog.getCatalog());
				orignalBlog.setTags(blog.getTags());
				blogService.saveBlog(orignalBlog);
	        } else {
	    		User user = (User)userDetailsService.loadUserByUsername(username);
	    		blog.setUser(user);
				blogService.saveBlog(blog);
	        }
			
		} catch (ConstraintViolationException e)  {
			return ResponseEntity.ok().body(new Response(false, ConstraintViolationExceptionHandler.getMessage(e)));
		} catch (Exception e) {
			return ResponseEntity.ok().body(new Response(false, e.getMessage()));
		}
		
		String redirectUrl = "/u/" + username + "/blogs/" + blog.getId();
		return ResponseEntity.ok().body(new Response(true, "保存博客", redirectUrl));
	}
	
	/**
	 * 删除博客
	 * @param username
	 * @param id
	 * @return
	 */
	@DeleteMapping("/{username}/blogs/{id}")
	@PreAuthorize("authentication.name.equals(#username) or hasAnyAuthority('ROLE_ADMIN')") 
	public ResponseEntity<Response> deleteBlog(@PathVariable("username") String username,@PathVariable("id") Long id) {
		try {
			blogService.removeBlog(id);
		} catch (Exception e) {
			return ResponseEntity.ok().body(new Response(false, e.getMessage()));
		}
		
		String redirectUrl = "/u/" + username + "/blogs";
		return ResponseEntity.ok().body(new Response(true, "删除博客成功", redirectUrl));
	}
	
	
	public boolean readingIsMax(Long id){
		Date date=new Date();
		ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
		HttpServletRequest request = attributes.getRequest();
		String ip= IpUtil.getClinetIpByReq(request);
		BlogIPVO blogIPVO=new BlogIPVO(id,ip);
		if (org.apache.commons.lang.time.DateUtils.isSameDay(date,currentDate)){
			if(ipMapsCounts.containsKey(blogIPVO)){
				Integer oldValue=ipMapsCounts.get(blogIPVO);
				if(oldValue<=readingMax) {
					Integer newValue=oldValue+1;
					ipMapsCounts.replace(blogIPVO,oldValue,newValue);
					return true;
				}
				else
					return  false;
			}
			else{
				ipMapsCounts.put(blogIPVO,1);
				return true;
			}
		}
		else{
			currentDate=date;
			ipMapsCounts.clear();
			ipMapsCounts.putIfAbsent(blogIPVO,1);
			return false;
		}
	}
}