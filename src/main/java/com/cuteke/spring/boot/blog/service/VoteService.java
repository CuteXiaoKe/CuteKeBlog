package com.cuteke.spring.boot.blog.service;

import com.cuteke.spring.boot.blog.domain.User;
import com.cuteke.spring.boot.blog.domain.Vote;

import java.util.List;

/**
 * Vote 服务接口.
 * 
 * @since 1.0.0 2017年4月9日
 * @author <a href="http://www.cuteke.cm">CuteKe</a>
 */
public interface VoteService {
	/**
	 * 根据id获取 Vote
	 * @param id
	 * @return
	 */
	Vote getVoteById(Long id);
	/**
	 * 删除Vote
	 * @param id
	 * @return
	 */
	void removeVote(Long id);

	/**
	 * 根据用户列举点赞
	 * @param user
	 * @return
	 */
	List<Vote> listVote(User user); 
}
