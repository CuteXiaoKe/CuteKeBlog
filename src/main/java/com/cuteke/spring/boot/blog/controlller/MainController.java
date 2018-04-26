package com.cuteke.spring.boot.blog.controlller;

import java.util.ArrayList;
import java.util.List;

import com.cuteke.spring.boot.blog.domain.User;
import com.cuteke.spring.boot.blog.service.AuthorityService;
import com.cuteke.spring.boot.blog.service.UserService;
import com.cuteke.spring.boot.blog.util.ConstraintViolationExceptionHandler;
import com.cuteke.spring.boot.blog.vo.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.embedded.EmbeddedServletContainerCustomizer;
import org.springframework.boot.web.servlet.ErrorPage;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import com.cuteke.spring.boot.blog.domain.Authority;

import javax.validation.ConstraintViolationException;

/**
 * 主页控制器.
 * 
 * @since 1.0.0 2017年5月28日
 * @author <a href="http://www.cuteke.com">CuteKe</a> 
 */
@Controller
public class MainController {
	
	private static final Long ROLE_USER_AUTHORITY_ID = 3L;
	@Autowired
	private UserService userService;
	
	@Autowired
	private AuthorityService authorityService;
	
	@GetMapping("/")
	public String root() {
		return "redirect:/index";
	}
	
	@GetMapping("/index")
	public String index() {
	    return "redirect:/blogs";
	}

	@GetMapping("/login")
	public String login() {
		if (SecurityContextHolder.getContext().getAuthentication() !=null && SecurityContextHolder.getContext().getAuthentication().isAuthenticated()
				&&  !SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString().equals("anonymousUser")) {
			return "redirect:/index";
		}
		else 
			return "login";
	}

	@GetMapping("/login-error")
	public String loginError(Model model) {
		model.addAttribute("loginError", true);
		model.addAttribute("errorMsg", "登陆失败，用户名或者密码错误！");
		return "login";
	}
	
	@GetMapping("/register")
	public String register() {
		return "register";
	}
	
    /**
     * 注册用户
     * @param user
     * @return
     */
    @PostMapping("/register")
    public ResponseEntity<Response> registerUser(User user) {
        List<Authority> authorities = new ArrayList<>();
		authorities.add(authorityService.getAuthorityById(ROLE_USER_AUTHORITY_ID));
        user.setAuthorities(authorities);
        user.setEncodePassword(user.getPassword());

		try {
        userService.registerUser(user);
		} catch (ConstraintViolationException e)  {
			return ResponseEntity.ok().body(new Response(false, ConstraintViolationExceptionHandler.getMessage(e)));
		} catch (Exception e) {
			return ResponseEntity.ok().body(new Response(false, e.getMessage()));
		}

		return ResponseEntity.ok().body(new Response(true, "注册成功", null));
    }
}
