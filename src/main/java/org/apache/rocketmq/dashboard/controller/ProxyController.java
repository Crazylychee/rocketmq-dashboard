/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.rocketmq.dashboard.controller;

import jakarta.annotation.Resource;
import org.apache.rocketmq.dashboard.permisssion.Permission;
import org.apache.rocketmq.dashboard.service.ProxyService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/proxy")
@Permission
public class ProxyController {
    @Resource
    private ProxyService proxyService;

    @RequestMapping(value = "/homePage.query", method = RequestMethod.GET)
    @ResponseBody
    public Object homePage() {
        return proxyService.getProxyHomePage();
    }


    @RequestMapping(value = "/addProxyAddr.do", method = RequestMethod.POST)
    @ResponseBody
    public Object addProxyAddr(@RequestParam String newProxyAddr) {
        proxyService.addProxyAddrList(newProxyAddr);
        return true;
    }

    @RequestMapping(value = "/updateProxyAddr.do", method = RequestMethod.POST)
    @ResponseBody
    public Object updateProxyAddr(@RequestParam String proxyAddr) {
        proxyService.updateProxyAddrList(proxyAddr);
        return true;
    }
}
