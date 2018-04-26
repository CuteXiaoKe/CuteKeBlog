package com.cuteke.spring.boot.blog.service;

import com.cuteke.spring.boot.blog.domain.VisitorLog;

/**
 * Created by ASUS on 2018/4/15.
 */
public interface VisitorLogService {
    VisitorLog saveVistorLog(VisitorLog visitorLog);
}
