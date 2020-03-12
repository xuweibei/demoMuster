//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { DeleteStudentClassList,DeleteStudentClassDelete } from '@/actions/base';
import ContentBox from '@/components/ContentBox';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';


class TeachCenterManage extends React.Component {

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
                branchId: '',
                studentName: '',
                mobile: '',
                courseArrangeName: "",
            },

            data: [],
            dic_orgIds: [],
            totalRecord: 0,
            loading: false,
        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status', 'teach_center_type']);

        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [
        {
            title: '课程班名称',
            width: 120,
            fixed: 'left',
            dataIndex: 'courseplanName'
        },
        {
            title: '学生姓名',
            dataIndex: 'studentName', 
        },
        {
            title: '手机号',
            dataIndex: 'mobile', 
        },
        {
            title: '课程状态(编码)',
            dataIndex: 'finishStatus',
           
        },
        {
            title: '扣费条数',
            dataIndex: 'deductCount',
          
        },
        {
            title: '考勤条数',
            dataIndex: 'attendCount', 
        }, 
        {
            title: '课程状态',
            dataIndex: 'finishStatusStr', 
            width: 120,
        },
        {
            title: '操作', 
            fixed: 'right',
            width: 120,
            render:(text,record)=>{
                return <Button icon='delete' onClick = {()=>this.deleteStudent(record)}>删除</Button>
                if(record.finishStatus == 1 || record.deductCount > 1 ){
                    return <Button icon='delete' onClick = {()=>this.deleteStudent(record)}>删除</Button>
                }else{
                    return '--'
                } 
            }
        },

    ];


    deleteStudent = (value)=>{
        let condition = {
            studentId:value.studentId,
            courseArrangeId:value.courseArrangeId,
            courseCategoryId:value.courseCategoryId,
            deductCount:value.deductCount,
            finishStatus:value.finishStatus
        }
        console.log(condition)
        return 
        this.props.DeleteStudentClassDelete(condition).payload.promise.then((response) => {
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

    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.DeleteStudentClassList(condition).payload.promise.then((response) => {
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
                case "Edit":
                case "Delete":
                    break;

            }
        }
    }


    //渲染，根据模式不同控制不同输出
    render() {
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>

        switch (this.state.editMode) {
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
                                        <FormItem {...searchFormItemLayout} label={'所属分部'} >
                                            {getFieldDecorator('orgId', { initialValue: this.state.pagingSearch.orgId })(
                                                <SelectFBOrg scope={'all'} hideAll={false} />

                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                                            {getFieldDecorator('studentName', { initialValue: this.state.pagingSearch.studentName })(
                                                <Input placeholder='请输入学生姓名'/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'学生手机号'} >
                                            {getFieldDecorator('mobile', { initialValue: this.state.pagingSearch.mobile })(
                                                <Input placeholder='请输入学生手机号'/>
                                            )}
                                        </FormItem>
                                    </Col> 
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'课程班名称'} >
                                            {getFieldDecorator('courseArrangeName', { initialValue: this.state.pagingSearch.courseArrangeName })(
                                                <Input placeholder='请输入课程班名称'/>
                                            )}
                                        </FormItem>
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
                            dataSource={this.state.data}//数据
                            bordered
                            scroll={{ x: 1300 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="end" align="middle" type="flex">
                                <Col span={24} className='search-paging-control'>
                                    <Pagination showSizeChanger
                                        current={this.state.pagingSearch.currentPage}
                                        defaultPageSize={this.state.pagingSearch.pageSize}      
                                        pageSizeOptions = {['10','20','30','50','100','200']}
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
const WrappedTeachCenterManage = Form.create()(TeachCenterManage);

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
        DeleteStudentClassList: bindActionCreators(DeleteStudentClassList, dispatch),
        DeleteStudentClassDelete: bindActionCreators(DeleteStudentClassDelete, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachCenterManage);
