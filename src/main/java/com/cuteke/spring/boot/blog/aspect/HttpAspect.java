package com.cuteke.spring.boot.blog.aspect;

import com.cuteke.spring.boot.blog.domain.VisitorLog;
import com.cuteke.spring.boot.blog.service.VisitorLogService;
import com.cuteke.spring.boot.blog.util.IpUtil;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;

/**
 * 切面配置类
 *
 * @since 1.0.0 2017年5月30日
 * @author <a href="http://www.cuteke.com">CuteKe</a> 
 */
@Aspect
@Component
public class HttpAspect {

    @Autowired
    private VisitorLogService vistorLogService;
    
    private final static Logger logger = LoggerFactory.getLogger(HttpAspect.class);


    @Pointcut("execution(public * com.cuteke.spring.boot.blog.controlller.*.*(..))")
    public void log() {
    };

    @Before("log()")
    public void doBefore(JoinPoint joinPoint) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes.getRequest();
        
        String url=new String(request.getRequestURL());
        String method=request.getMethod();
        String ip=IpUtil.getClinetIpByReq(request);
        String class_method=joinPoint.getSignature().getDeclaringTypeName() + "." + joinPoint.getSignature().getName();
        String args= Arrays.toString(joinPoint.getArgs());
//        //url
//        logger.info("url={}", request.getRequestURL());
//
//        //method
//        logger.info("method={}", request.getMethod());
//
//        //ip
//        logger.info("ip={}", request.getRemoteAddr());
//
//        //类方法
//        logger.info("class_method={}", joinPoint.getSignature().getDeclaringTypeName() + "." + joinPoint.getSignature().getName());
//
//        //参数
//        logger.info("args={}", joinPoint.getArgs());
        logger.info("url={} method={} ip={} class_method={} args={}", url, method
                , ip, class_method
                , joinPoint.getArgs());
        VisitorLog visitorLog=new VisitorLog(url,method,ip,IpUtil.getAddressByIP(ip),class_method,args);
        vistorLogService.saveVistorLog(visitorLog);
    }
}  
