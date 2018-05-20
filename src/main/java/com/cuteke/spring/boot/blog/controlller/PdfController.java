package com.cuteke.spring.boot.blog.controlller;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * PDF服务控制器
 * 
 * @since 1.0.0 2018年5月16日
 * @author <a href="http://www.cuteke.com">CuteKe</a> 
 */

@Controller
@RequestMapping(value = "/pdf")
public class PdfController {
    
    @GetMapping(value = "/resume")
    public String resumeService(){
        return "/pdf/resume";
    }
}
