package com.cuteke.spring.boot.blog.repository.es;

import com.cuteke.spring.boot.blog.domain.es.EsBlog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * EsBlog Repository接口.
 * 
 * @since 1. 0.0 2017年6月8日
 * @author <a href="http://www.cuteke.com">CuteKe</a> 
 */
public interface EsBlogRepository extends ElasticsearchRepository<EsBlog, String> {
    /**
     * 模糊查询(去重)
     * @param title
     * @param Summary
     * @param content
     * @param tags
     * @param pageable
     * @return
     */
    Page<EsBlog> findDistinctEsBlogByTitleContainingOrSummaryContainingOrContentContainingOrTagsContaining(String title,String Summary,String content,String tags,Pageable pageable);

    /**
     * 根据 Blog 的id 查询 EsBlog
     * @param blogId
     * @return
     */
    EsBlog findByBlogId(Long blogId);
}
