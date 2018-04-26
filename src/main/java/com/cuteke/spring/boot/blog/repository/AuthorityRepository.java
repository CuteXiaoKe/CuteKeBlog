package com.cuteke.spring.boot.blog.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cuteke.spring.boot.blog.domain.Authority;

/**
 * Authority 仓库.
 * 
 * @since 1.0.0 2017年5月30日
 * @author <a href="http://www.cuteke.com">CuteKe</a> 
 */
public interface AuthorityRepository extends JpaRepository<Authority, Long> {
}
