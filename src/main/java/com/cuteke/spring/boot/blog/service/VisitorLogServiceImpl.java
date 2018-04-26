package com.cuteke.spring.boot.blog.service;

import com.cuteke.spring.boot.blog.domain.VisitorLog;
import com.cuteke.spring.boot.blog.repository.VisitorLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;

/**
 * Created by ASUS on 2018/4/15.
 */
@Service
public class VisitorLogServiceImpl implements VisitorLogService{
    @Autowired
    private VisitorLogRepository visitorLogRepository;

    @Transactional
    @Override
    public VisitorLog saveVistorLog(VisitorLog visitorLog) {
        return visitorLogRepository.save(visitorLog);
    }
}
