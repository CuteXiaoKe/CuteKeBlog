package com.cuteke.spring.boot.blog.controlller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import com.cuteke.spring.boot.blog.vo.Menu;

/**
 * 后台管理控制器.
 * 
 * @since 1.0.0 2017年5月28日
 * @author <a href="http://www.cuteke.com">CuteKe</a> 
 */
@Controller
@RequestMapping("/admins")
public class AdminController {
 
    /**
     * 获取后台管理主页面
     * @param model
     * @return
     */
    @GetMapping
    public ModelAndView listUsers(Model model) {
        List<Menu> list = new ArrayList<>();
        list.add(new Menu("用户管理", "/users"));
        list.add(new Menu("博文管理", "/blogs/all"));
        list.add(new Menu("评论管理", "/comments/all"));
        model.addAttribute("list", list);
        return new ModelAndView("/admins/index", "model", model);
    }
}