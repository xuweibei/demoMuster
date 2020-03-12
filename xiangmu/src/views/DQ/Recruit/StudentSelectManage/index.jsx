/*
学生查询---列表查询
2018-05-31
王强
*/
//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, dataBind } from '@/utils';

//业务接口方法引入
import { getCampusByUniversityId } from '@/actions/base';
import { getFBStudentSelectList, editAdjustBranch } from '@/actions/recruit';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import SelectArea from '@/components/BizSelect/SelectArea';
import EditableUniversityTagGroup from '@/components/EditableUniversityTagGroup';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';


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

        this.state = {
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                regRegionId: '',
                studyUniversityId: '',
                studyCampusId: '',
                realName: '',
                certificateNo: '',
                mobile: '',
                isStudy: '',
            },
            UserSelecteds: [],
            data: [],
            dic_University: [],
            dic_Campus: [],
            totalRecord: 0,
            loading: false,
            isStudy: false
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status', 'sex', 'is_study', 'reg_source']);
        //首次进入搜索，加载服务端字典项内容

        this.onSearch();
    }
    componentWillUnMount() {
        Console.log("fff")
    }
    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        condition.currentPage = condition.currentPage;//修正分页参数
        if (condition.studyUniversityId.length > 0) {
            condition.studyUniversityId = condition.studyUniversityId[0].id
        }

        this.props.getFBStudentSelectList(condition).payload.promise.then((response) => {
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
        title: '所属分部区域',
        fixed: 'left',
        width: 150,
        dataIndex: 'regRegionName',
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
        title: '操作',
        key: 'action',
        width: 100,
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

    onBatchEdit(type, title) {
        this.onLookView("Edit", { ids: this.state.UserSelecteds, type: type, title: title })
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
                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'分部'} >
                                            {getFieldDecorator('branchId', { initialValue: this.state.pagingSearch.branchId })(
                                                <SelectFBOrg scope='my' hideAll={false} />
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
                                                                {this.state.dic_Campus.map((item, index) => {
                                                                    return <Option value={item.value} key={index} title={item.title}>{item.title}</Option>
                                                                })}
                                                            </Select>
                                                        )}
                                                    </div>
                                                </FormItem>
                                            </Col>
                                            : ''
                                    }



                                    <Col span={12} >
                                        <FormItem {...searchFormItemLayout} label="学生来源" >
                                            {getFieldDecorator('regSource', { initialValue: '' })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.reg_source.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
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
                            scroll={{ x: 1300 }}
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
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //各业务接口
        getFBStudentSelectList: bindActionCreators(getFBStudentSelectList, dispatch),//列表查询接口
        getCampusByUniversityId: bindActionCreators(getCampusByUniversityId, dispatch),
        editAdjustBranch: bindActionCreators(editAdjustBranch, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAscriptionManage);
