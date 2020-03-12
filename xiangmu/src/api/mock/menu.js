module.exports = {
  menus: [
    {
      key: "001",
      name: "首页",
      url: "/home",
      icon: "home",
      depth: 0,
    },
    {
      key: '002',
      name: '基础管理',
      icon: 'user',
      depth: 0,
      child: [
        {
          key: '002-001',
          name: '系统管理',
          depth: 1,
          child: [
            {
              key: "002-001-001",
              name: "菜单管理",
              url: "/Authority/MenuManage",
              depth: 2,
            },
            {
              key: "002-001-022",
              name: "内置角色管理",
              url: "/Authority/InnerRoleManage",
              depth: 2,
            },
            {
              key: "002-001-002",
              name: "角色管理",
              url: "/Authority/RoleManage",
              depth: 2,
            },
            {
              key: "002-001-003",
              name: "数据字典管理",
              url: "/Authority/DictionaryManage",
              depth: 2,
            },
            {
              key: "002-001-004",
              name: "上传模板管理",
              url: "/Authority/DictionaryManage",
              depth: 2,
            }
          ]
        },
        {
          key: "002-002",
          name: "基础管理",
          depth: 1,
          child: [
            {
              key: "002-002-001",
              name: "用户管理",
              url: "",
              depth: 2,
            },
            {
              key: "002-002-002",
              name: "机构管理",
              url: "/ZB/Basic/OrgManage",
              depth: 2,
            },
            {
              key: "002-002-003",
              name: "项目管理",
              url: "/ZB/Basic/ItemManage",
              depth: 2,
            },
            {
              key: "002-002-004",
              name: "科目管理",
              url: "/ZB/Basic/CourseCategoryManage",
              depth: 2,
            },
            {
              key: "002-002-005",
              name: "课程管理",
              url: "/ZB/Basic/BasicCourseManage",
              depth: 2,
            },
            {
              key: "002-002-006",
              name: "用户负责项目管理",
              url: "/ZB/Basic/AdminUserManage",
              depth: 2,
            },
            {
              key: "002-002-007",
              name: "用户负责分部管理",
              url: "/ZB/Basic/AdminUserBranchManage",
              depth: 2,
            },
            {
              key: "002-002-008",
              name: "分部大客户查询",
              url: "/ZB/Basic/OrgManage",
              depth: 2,
            },
            {
              key: "002-002-009",
              name: "教学点查询",
              url: "/ZB/Basic/OrgManage",
              depth: 2,
            },


            {
              key: "002-002-300",
              name: "用户负责高校及项目管理",
              url: "/FB/Basic/AdminUserManage",
              depth: 2,
            },
             {
              key: "002-002-301",
              name: "区域管理",
              url: "/FB/Basic/OrganizationAreaManage",
              depth: 2,
            }



          ]
        },
        {
          key: "002-003",
          name: "商品管理",
          depth: 1,
          child: [
            {
              key: "002-003-001",
              name: "班型管理",
              url: "",
              depth: 2,
            },
            {
              key: "002-003-002",
              name: "商品管理",
              url: "",
              depth: 2,
            }
          ]
        },
      ]
    },
    {
      key: '003',
      name: '大客户',
      icon: 'org-manage',
      depth: 0,
      child: [
        {
          key: '003-001',
          name: '大客户管理',
          depth: 1,
          child: [
            {
              key: '003-001-001',
              name: '大客户基本信息管理',
              url: '/ZB/Partner/PartnerManage',
              depth: 2,
            },
            {
              key: '003-001-002',
              name: '用户负责大客户管理',
              url: '/ZB/Partner/PartnerDevUserManage',
              depth: 2,
            },
          ]
        }
      ]
    },
    {
      key: '004',
      name: '招生管理',
      icon: 'teach-manage',
      depth: 0,
      child: [
        {
          key: '004-001',
          name: '基础管理',
          depth: 1,
          child: [
            {
              key: '004-001-001',
              name: '招生季管理',
              url: "/ZB/Recruit/RecruitBatchManage",
              depth: 2,
            },
          ]
        },
        {
          key: '004-002',
          name: '市场与咨询',
          depth: 1,
          child: [
            {
              key: '004-002-001',
              name: '学生市场保护期设置',
              url: '',
              depth: 2,
            }
          ]
        }
      ]
    },
    {
      key: '005',
      name: '教学管理',
      icon: 'user',
      depth: 0,
      child: [
        {
          key: '005-001',
          name: '基础管理',
          depth: 1,
          child: [
            {
              key: '005-001-001',
              name: '教师管理',
              url: '',
              depth: 2,
            },
          ]
        },
      ]
    },
    {
      key: '006',
      name: '学服学务',
      icon: 'user',
      depth: 0,
      child: [
        {
          key: '006-001',
          name: '面授开课计划及排课',
          depth: 1,
          child: [
            {
              key: '006-001-001',
              name: '开课批次管理',
              url: "/ZB/Course/CoursePlanBatchManage",
              depth: 2,
            },
          ]
        },
      ]
    },
    {
      key: '007',
      name: '财务管理',
      icon: 'user',
      depth: 0,
      child: [
        {
          key: '007-001',
          name: '基础管理',
          depth: 1,
          child: [
            {
              key: '007-001-001',
              name: '公司账户管理',
              url: '',
              depth: 2,
            },
          ]
        },
      ]
    }

  ],
  roles: [
    "4A79E33E-26CC-4B4F-99DD-509DEEB5CC43"
  ]
}
