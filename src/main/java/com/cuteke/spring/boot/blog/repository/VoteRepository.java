package com.cuteke.spring.boot.blog.repository;

import com.cuteke.spring.boot.blog.domain.Comment;
import com.cuteke.spring.boot.blog.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import com.cuteke.spring.boot.blog.domain.Vote;

import java.util.List;

/**
 * Vote Repository接口.
 * @since 1.0.0 2017年6月6日
 * @author <a href="http://www.cuteke.com">CuteKe</a> 
 */
public interface VoteRepository extends JpaRepository<Vote, Long> {
    /**
     * 根据用户查询
     * @param user
     * @return
     */
    List<Vote> findByUser(User user);
}
