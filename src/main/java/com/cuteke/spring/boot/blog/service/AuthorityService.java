package com.cuteke.spring.boot.blog.service;

import com.cuteke.spring.boot.blog.domain.Authority;

/**
 * Authority 服务接口.
 * 
 * @since 1.0.0 2017年5月30日
 * @author <a href="http://www.cuteke.com">CuteKe</a> 
 */
public interface AuthorityService {
	/**
	 * 根据ID查询 Authority
	 * @param id
	 * @return
	 */
    Authority getAuthorityById(Long id);
}
