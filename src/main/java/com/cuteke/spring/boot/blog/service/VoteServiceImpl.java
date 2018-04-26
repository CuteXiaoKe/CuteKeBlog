package com.cuteke.spring.boot.blog.service;

import com.cuteke.spring.boot.blog.domain.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cuteke.spring.boot.blog.domain.Vote;
import com.cuteke.spring.boot.blog.repository.VoteRepository;

import java.util.List;

/**
 * Vote 服务实现.
 * @since 1.0.0 2017年6月6日
 * @author <a href="http://www.cuteke.com">CuteKe</a> 
 */
@Service
public class VoteServiceImpl implements VoteService {

    @Autowired
    private VoteRepository voteRepository;
    
	@Override
	public Vote getVoteById(Long id) {
		return voteRepository.findOne(id);
	}
	
	@Override
	public void removeVote(Long id) {
		voteRepository.delete(id);
	}

	@Override
	public List<Vote> listVote(User user) {
		return  voteRepository.findByUser(user);
	}
}
