/*

*/
//标准组件环境
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider ,DatePicker} from 'antd';
const FormItem = Form.Item;
const dateFormat = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;
const { Option, OptGroup } = Select;
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, dataBind } from '@/utils';

//业务接口方法引入
import { getCampusByUniversityId,UserSourceDivision } from '@/actions/base';
import { getFBStudentSelectList2, editAdjustBranch } from '@/actions/recruit';
import { subitem } from '@/actions/course';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox'; 
import EditableUniversityTagGroup from '@/components/EditableUniversityTagGroup';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import moment from 'moment';
import FileDownloader from '@/components/FileDownloader';
import './index.css'

class StudentSelectManage extends React.Component {

    constructor() {
        super()
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
        let timeArr = timestampToTime(new Date().getTime()).split('-');
        let nowYear = timeArr[0];
        let studyUniversityEnterYear = [];
        for(var i=0; i<20; i++){
            studyUniversityEnterYear.push({ title: (nowYear-i), value: (nowYear-i) })
        }

        this.state = {
            all_org_list:[],
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                regRegionId: '',
                sourceBranchId:'',
                studyUniversityId: '',
                studyCampusId: '',
                realName: '',
                certificateNo: '',
                mobile: '',
                isStudy: '',
                createDateStart:'',
                createDateEnd:'',
                email:'',
                regSource: '',
                subRegSource: ''

            },
            UserSelecteds: [],
            listItem: [],
            data: [],
            dic_University: [],
            dic_Campus: [],
            totalRecord: 0,
            loading: false,
            isStudy: false,
            startValue: null,
            endValue: null,
            studyUniversityEnterYear: studyUniversityEnterYear,//入学年份列表
        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status', 'sex', 'is_study', 'reg_source']);
        //首次进入搜索，加载服务端字典项内容

        this.UserSource();
        // this.onSearch();
    }
    componentWillUnMount() {
    }
   //用户来源分部
   UserSource = () => { 
    this.props.UserSourceDivision().payload.promise.then((response) => {
      let data = response.payload.data; 
          if(data.state == 'success'){
              let all_org_list = [];
              let orderDQList = data.data.sort((a, b) => { return a.orderNo > b.orderNo ? 0 : 1; })//按大区顺序排列
              //循环
              orderDQList.map((a) => {
              //没有分部
              if (a.organizationList.length == 0) {
                  return;
              }

              let orderFBList = a.organizationList.sort((a, b) => { return a.orderNo > b.orderNo ? 0 : 1; });//分部排序
              let dqItem = { orgId: `${a.orgId}`, orgName: a.orgName, children: [], state: a.state };
              orderFBList.map((fb) => {
                  dqItem.children.push({ orgId: `${fb.orgId}`, orgName: fb.orgName, state: fb.state })
              })
              all_org_list = [...all_org_list, dqItem];
              });
              this.setState({ all_org_list })
          }else{
            message.error(data.msg)
          }
      }
    )
  }
    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        condition.currentPage = condition.currentPage;//修正分页参数
        if (condition.studyUniversityId.length > 0) {
            condition.studyUniversityId = condition.studyUniversityId[0].id
        }
        let createDateStart = condition.createDateStart;
        if(createDateStart){
            condition.createDateStart = createDateStart[0];
            condition.createDateEnd = createDateStart[1];
        }
        this.props.getFBStudentSelectList2(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.setState({ pagingSearch: condition, ...data, loading: false })
            }
        })
    }

    disabledStartDate = (startValue) => {
        const endValue = this.state.endValue;
        if (!startValue || !endValue) {
            return false;
        }
        return startValue.valueOf() > endValue.valueOf();
    }
  
    disabledEndDate = (endValue) => {
        const startValue = this.state.startValue;
        if (!endValue || !startValue) {
            return false;
        }
        return endValue.valueOf() <= startValue.valueOf();
    }
    handleStartOpenChange = (open) => {
        if (!open) {
            this.setState({ endOpen: true });
        }
    }
  
    handleEndOpenChange = (open) => {
        this.setState({ endOpen: open });
    }
    onChange = (field, value) => {
        this.setState({
            [field]: value,
        });
    }
  
    onStartChange = (value) => {
        this.onChange('startValue', value);
    }
  
    onEndChange = (value) => {
        this.onChange('endValue', value);
    }

    //检索校区列表数据
    fetchCampusList = (universityId) => {
        let condition = { currentPage: 1, pageSize: 999, universityId: universityId };
        this.props.getCampusByUniversityId(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message);
            }
            else {
                this.setState({ dic_Campus: data.data.map((a) => { return { title: a.campusName, value: a.campusId.toString() } }) });
            }
        })
    }

    //table 输出列定义
    columns = [{
      title: '所属分部',
      fixed: 'left',
      width: 120,
      dataIndex: 'branchName',
    },
    {
      title: '用户来源分部',
      dataIndex: 'sourceBranchName'
    },
      {
        title: '所属区域',
        dataIndex: 'regRegionName'
      },
    {
        title: '学生姓名',
        dataIndex: 'realName'
    },
    {
        title: '性别',
        dataIndex: 'gender',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.sex, record.gender);
        }
    },
    {
        title: '学生来源',
        dataIndex: 'regSource',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.reg_source, record.regSource);
        }
    },
    {
        title: '目前情况',
        dataIndex: 'isStudy',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.is_study, record.isStudy);
        }
    },

    {
        title: '在读高校',
        dataIndex: 'studyUniversityName',
    },
    {
        title: '入学年份',
        dataIndex: 'studyUniversityEnterYear'
    },
    {
        title: '证件号',
        dataIndex: 'certificateNo'
    },
    {
        title: '手机',
        dataIndex: 'mobile'
    },
    {
        title: '微信',
        dataIndex: 'weixin'
    },
    {
        title: 'QQ',
        dataIndex: 'qq'
    },
    {
        title: '邮箱',
        dataIndex: 'email'
    },
    {
        title: '创建时间',
        dataIndex: 'createDate',
        render: (text, record, index) => {
            return timestampToTime(record.createDate)
        }
    },
    {
        title: '学生创建人',
        dataIndex: 'creator'
    },
    {
        title: '操作',
        key: 'action',
        width: 120,
        fixed: 'right',
        render: (text, record) => (
            <Row justify="space-around" type="flex">
                {<Button onClick={() => { this.onLookView('View', record) }}>查看</Button>}
            </Row>
        ),
    }
    ];

    handleTableChange = (pagination, filters, sorter) => {
        //const pager = this.state.pagingSearch;
        //pager.currentPage = pagination.current;
        //this.setState({ pagination: pager });
        this.fetch({
            results: pagination.pageSize,
            currentPage: pagination.currentPage,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters,
        });
    }

    //浏览视图
    onLookView = (op, item) => {
        this.setState({
            editMode: op,//编辑模式
            currentDataModel: item,//编辑对象
        });
    };
    //视图回调
    onViewCallback = (dataModel) => {
        if (!dataModel) {
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }
        else {
            switch (this.state.editMode) {

                case "Edit": //提交
                    this.props.editAdjustBranch(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    //提交
                    break;

            }
        }
    }
    subitem = (value) => {
        let id = '';
        this.state.reg_source.forEach((e)=>{
            if(e.value==value) id = e.systemCommonId;
        })
        this.props.subitem(id).payload.promise.then((response) => {
          let data = response.payload.data.data;
          if(response.payload.data.state == 'success'){
              this.setState({
                listItem: data
              })
          }
        })
      }

    onBatchEdit(type, title) {
        this.onLookView("Edit", { ids: this.state.UserSelecteds, type: type, title: title })
    }
    disabledBeginDate = (endValue) => {
        /*
            endValue  这个是展示的时候，所有的日期；
            nowTime   这是个现在的时间；
            startValue 这个是设定好的时间；
        */
        const startValue = new Date(2018,7,21);
        const nowTime = new Date();
        return endValue.valueOf()>nowTime.valueOf() || endValue.valueOf()<startValue.valueOf();
    }
    onSelectChange = (value) => {
        this.state.pagingSearch.regSource = value;
        this.state.pagingSearch.subRegSource = '';
        this.setState({
            pagingSearch: this.state.pagingSearch
        })
        this.props.form.setFieldsValue({
            subRegSource: '',
        });
        this.subitem(value)
    }
    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
        var rowSelection = {
            selectedRowKeys: this.state.UserSelecteds,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ UserSelecteds: selectedRowKeys })
            },
            getCheckboxProps: record => ({
                disabled: false,    // Column configuration not to be checked
            }),
        };
        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "View":
                block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
                break;
            case "Delete":
            case "Manage":
            default:
                //除查询外，其他扩展按钮数组
                let extendButtons = [];

                let name = this.props.currentUser.user.loginName;
                // if(name == 'admin' || name == 'sysadmin'){
                    extendButtons.push(
                        <FileDownloader
                            apiUrl={'/edu/student/exportList2'}//api下载地址
                            method={'get'}//提交方式
                            options={this.state.pagingSearch}//提交参数
                            title={'导出'}
                        >
                        </FileDownloader>);
                // }
                
                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'原始分部'}>
                                            {getFieldDecorator('sourceBranchId',{ initialValue:this.state.pagingSearch.sourceBranchId})(
                                             <Select
                                                showSearch={true}
                                                filterOption={(inputValue, option) => {  
                                                var result = false;
                                                for(var i = 0; i < option.props.children.length; i++){
                                                if(option.props.children[i].indexOf(inputValue) != -1){
                                                    result = true;
                                                    break;
                                                }
                                                }
                                                return result;
                                                }}
                                            >
                                                <Option value=''>全部</Option> 
                                                {this.state.all_org_list.map((dqItem) => {
                                                    return <OptGroup label={dqItem.orgName}>
                                                        {dqItem.children.map((fbItem, index) => {
                                                        return <Option title={fbItem.state === 0?fbItem.orgName+'【停用】':fbItem.orgName} value={fbItem.orgId} key={index}>{fbItem.orgName}{fbItem.state === 0 ? '【停用】' : ''}</Option>
                                                        })}
                                                    </OptGroup>
                                                })}
                                            </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="目前情况"
                                        >
                                            {getFieldDecorator('isStudy', { initialValue: this.state.pagingSearch.isStudy })(
                                                <Select
                                                    onChange={(value) => {
                                                        if (value == 1) {
                                                            this.setState({
                                                                isStudy: true
                                                            })
                                                        } else {
                                                            this.setState({
                                                                isStudy: false
                                                            })
                                                        }
                                                    }}>
                                                    <Option value="">全部</Option>
                                                    <Option value='1' key='1'>在读</Option>
                                                    <Option value='0' key='0'>在职</Option>
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    {
                                        this.state.isStudy ?
                                            <Col span={12} >
                                                <FormItem
                                                    {...searchFormItemLayout}
                                                    label="在读院校/校区"
                                                ><div className='flex-row'>
                                                        {getFieldDecorator('studyUniversityId', { initialValue: dataBind(this.state.pagingSearch.studyUniversityId) })(

                                                            <EditableUniversityTagGroup maxTags={1} onChange={(value) => {
                                                                if (value.length > 0) {
                                                                    let id = value[0].id
                                                                    this.fetchCampusList(id);
                                                                }
                                                                else {
                                                                    this.setState({ dic_Campus: [] })
                                                                }
                                                                setTimeout(() => {
                                                                    this.props.form.resetFields(['studyCampusId']);
                                                                }, 500);
                                                            }} />

                                                        )}
                                                        <div className='split_button'></div>
                                                        {getFieldDecorator('studyCampusId', { initialValue: dataBind(this.state.pagingSearch.studyCampusId) })(
                                                            <Select>
                                                                <Option value=''>--请选择院校-- </Option>
                                                                {this.state.dic_Campus.map((item, index) => {
                                                                    return <Option value={item.value} key={index}>{item.title}</Option>
                                                                })}
                                                            </Select>
                                                        )}
                                                    </div>
                                                </FormItem>
                                            </Col>
                                            : ''
                                    }

                                    {
                                        this.state.isStudy ? <Col span={12} >
                                            <FormItem {...searchFormItemLayout} label="入学年份" >
                                                {getFieldDecorator('studyUniversityEnterYear', { initialValue: this.state.pagingSearch.studyUniversityEnterYear })(
                                                    <Select>
                                                        <Option value="">全部</Option>
                                                        {this.state.studyUniversityEnterYear.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        : ''
                                    }


                                    <Col span={12} >
                                        <FormItem {...searchFormItemLayout} label="学生来源" >
                                            {getFieldDecorator('regSource', { initialValue: this.state.pagingSearch.regSource })(
                                                <Select
                                                    onChange={(value, e) => this.onSelectChange(value)}
                                                    className='Parentitem'
                                                >
                                                    <Option value="">全部</Option>
                                                    {this.state.reg_source.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )
                                            }
                                            {
                                                this.state.listItem.length ? getFieldDecorator('subRegSource', {
                                                    initialValue: this.state.pagingSearch.subRegSource
                                                  })(
                                                    <Select className='Subitem'>
                                                        <Option value="">全部</Option>
                                                      {
                                                        this.state.listItem?this.state.listItem.map((i,index)=>{
                                                          return <Option title={i.title} value={i.value} key={i.value + '_' + index}>{i.title}</Option>
                                                        }):[]
                                                      }
                                                    </Select>
                                                  )
                                                  : ''
                                            }
                                        </FormItem>
                                    </Col>

                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                                            {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                                                <Input placeholder="请输入学生姓名" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'微信'} >
                                            {getFieldDecorator('weixin', { initialValue: this.state.pagingSearch.weixin })(
                                                <Input placeholder="请输入微信" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'证件号'} >
                                            {getFieldDecorator('certificateNo', { initialValue: this.state.pagingSearch.certificateNo })(
                                                <Input placeholder="请输入证件号" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'手机号'} >
                                            {getFieldDecorator('mobile', { initialValue: this.state.pagingSearch.mobile })(
                                                <Input placeholder="请输入手机号" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'QQ'} >
                                            {getFieldDecorator('qq', { initialValue: this.state.pagingSearch.qq })(
                                                <Input placeholder="请输入QQ" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem  {...searchFormItemLayout} label={'邮箱'}>
                                            {getFieldDecorator('email',{ initialValue:this.state.pagingSearch.email})(
                                                <Input placeholder='请输入邮箱' />
                                            )}
                                        </FormItem>
                                    </Col>

                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="创建日期">
                                            {getFieldDecorator('createDateStart', { initialValue: this.state.pagingSearch.createDateStart?[moment(this.state.pagingSearch.createDateStart,dateFormat),moment(this.state.pagingSearch.createDateEnd,dateFormat)]:[] })(
                                                <RangePicker
                                                disabledDate={this.disabledBeginDate}
                                                style={{width:200}}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                    </Col>
                                    <Col span={12}>
                                    </Col>
                                </Row>
                            </Form>
                        }
                    </ContentBox>
                    {/* 内容分割线 */}
                    <div className="space-default"></div>
                    {/* 数据表格 */}
                    <div className="search-result-list">
                        <Table columns={this.columns} //列定义
                            loading={this.state.loading}
                            pagination={false}
                            rowKey={'studentId'}
                            // rowSelection={rowSelection}
                            dataSource={this.state.data}//数据
                            onChange={this.handleTableChange}
                            bordered
                            scroll={{ x: 1800 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="space-between" align="middle" type="flex">

                                <Col span={24} className='search-paging-control'>
                                    <Pagination showSizeChanger
                                        current={this.state.pagingSearch.currentPage}
                                        defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                                        onShowSizeChange={this.onShowSizeChange}
                                        onChange={this.onPageIndexChange}
                                        showTotal={(total) => { return `共${total}条数据`; }}
                                        total={this.state.totalRecord} />
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>);
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedAscriptionManage = Form.create()(StudentSelectManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    let { currentUser } = state.auth;
    return { Dictionarys, currentUser };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //各业务接口
        getFBStudentSelectList2: bindActionCreators(getFBStudentSelectList2, dispatch),//列表查询接口
        getCampusByUniversityId: bindActionCreators(getCampusByUniversityId, dispatch),
        editAdjustBranch: bindActionCreators(editAdjustBranch, dispatch),
        subitem:bindActionCreators(subitem, dispatch),
        //用户分部来源
        UserSourceDivision: bindActionCreators(UserSourceDivision, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAscriptionManage);
