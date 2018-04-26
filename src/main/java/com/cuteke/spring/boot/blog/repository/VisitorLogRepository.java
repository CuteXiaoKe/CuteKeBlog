package com.cuteke.spring.boot.blog.repository;

import com.cuteke.spring.boot.blog.domain.VisitorLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * VistorLog Repository接口.
 * @since 1.0.0 2017年6月6日
 * @author <a href="http://www.cuteke.com">CuteKe</a> 
 */
@Repository
public  interface VisitorLogRepository extends JpaRepository<VisitorLog,Long> {
}
