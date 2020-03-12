//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal, DatePicker } from 'antd';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, formatMoment } from '@/utils';
const dateFormat = 'YYYY-MM-DD';
import moment from 'moment';
//业务接口方法引入
import { BrochureReleaseDesk, addOrEditOrDelMaterial, addOrRemoveChildMaterials } from '@/actions/material';
import { getTeachCenterByBranchId } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';
import EditableTeacher from '@/components/EditableTeacher';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
//订单详情
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';

class MaterialGetQuery extends React.Component {

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
                orgName: '',
                materialType: '',
                materialStatus: '',
                isPack: '',
                isOutside: '',
                itemId: '',
                courseCategoryId:'',
                teacher: '',
                courseId: '',
                teachCenter: ''
            },

            data: [],
            totalRecord: 0,
            loading: false,
            bz_teach_center_list:[],
            UserSelecteds: [],
            teacherIdData: [],
            courseIdData: [],
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['material_type']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [
        {
            title: '分部',
            width: 150,
            fixed: 'left',
            dataIndex: 'branchName'
        },
        {
            title: '教学点',
            dataIndex: 'teachCenter',
            width:120,
        },
        {
            title: '学生姓名',
            dataIndex: 'realName',
            width:120,
            render: (text, record, index) => {
                return <span>
                    <a href="javascript:;" onClick={() => { this.onLookView('ViewStudentDetail', record); }}>{text}</a>
                </span>
            }
        },
        {
            title: '手机号',
            width: 120,
            dataIndex: 'mobile',
        },
        {
            title: '资料名称',
            width: 220,
            dataIndex: 'materialName'
        },
        {
            title: '打包资料',
            width: 80,
            dataIndex: 'isPack',
        },
        {
            title: '资料类型',
            width: 100,
            dataIndex: 'materialType',
        },
        {
            title: '订单号',
            width: 200,
            dataIndex: 'orderSn',
            render: (text, record, index) => {
                return <span>
                    <a href="javascript:;" onClick={() => { this.onLookView('ViewOrderDetail', record); }}>{text}</a>
                </span>
            }
        },
        {
            title: '主要商品',
            dataIndex: 'productNames',
        },
        {
            title: '教师',
            dataIndex: 'teacher',
            width:120,
        },
        {
            title: '领取方式',
            width:120,
            dataIndex: 'receiveWay',
        },
        {
            title: '领取人',
            width:120,
            dataIndex: 'receiver',
        },
        {
            title: '领取日期',
            width:120,
            fixed: 'right',
            dataIndex: 'receiveDate',
            render: text => <span>{timestampToTime(text)}</span>
        },
    ];




    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;

        this.setState({ teacherIdData: condition.teacher });
        this.setState({ courseIdData: condition.courseId });    

        condition.teacher = condition.teacher.length ? condition.teacher[0].id : '';
            
        condition.courseId = condition.courseId.length ? condition.courseId[0].id : '';

        let receiveStartDate = condition.receiveStartDate;
        if(receiveStartDate){
            condition.receiveStartDate = formatMoment(receiveStartDate[0])
            condition.receiveEndDate = formatMoment(receiveStartDate[1])
        }

        this.props.BrochureReleaseDesk(condition).payload.promise.then((response) => {
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
        
    }

    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>

        switch (this.state.editMode) {
            case 'ViewStudentDetail':
                block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
                break;
            case 'ViewOrderDetail':
                block_content = <OrderDetailView viewCallback={this.onViewCallback}
                    studentId={this.state.currentDataModel.studentId}
                    orderId={this.state.currentDataModel.orderId}
                    tab={3}
                />
                break;
            case "Manage":
            default:

                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                
                extendButtons.push(
                    <FileDownloader
                      apiUrl={'/edu/materialReceive/exportDoubleMaterials'}//api下载地址
                      method={'post'}//提交方式
                      options={this.state.pagingSearch}//提交参数
                      title={'导出重复领取'}
                    >
                    </FileDownloader>);
                var rowSelection = {
                    selectedRowKeys: this.state.UserSelecteds,
                    onChange: (selectedRowKeys, selectedRows) => {
                        this.setState({ UserSelecteds: selectedRowKeys })
                    },
                    getCheckboxProps: record => ({
                        disabled: false,    // Column configuration not to be checked
                    }),
                };
                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row gutter={24}>
                                <Col span={12} >
                                    <FormItem {...searchFormItemLayout} label='分部'>
                                        {getFieldDecorator('branchId', {
                                        initialValue: this.state.pagingSearch.branchId,
                                        })(
                                        <SelectFBOrg  scope='my'  hideAll={false}  onSelectChange={(value, name) => {
                                            var branchId = null;
                                            if(value){
                                            branchId = value;
                                            }
                                            this.setState({branchId: branchId});
                                            if (value) {
                                            let  condition = { currentPage: 1, pageSize: 99, branchId: branchId }
                                            this.props.getTeachCenterByBranchId(condition).payload.promise.then((response) => {
                                                let data = response.payload.data;
                                                let list=[];
                                                if (data.state === 'success') {
                                                data.data = data.data || [];
                                                data.data.map(r => {
                                                    list.push({
                                                    value: r.orgId,
                                                    title: r.orgName
                                                    })
                                                });

                                                this.state.pagingSearch.teachCenter = '';
                                                this.setState({ pagingSearch: this.state.pagingSearch });

                                                this.setState({ bz_teach_center_list: list });
                                                setTimeout(() => {
                                                    this.props.form.resetFields(['teachCenter']);
                                                }, 500);
                                                }
                                                else {
                                                message.error(data.message);
                                                }
                                            })
                                            }

                                        }}
                                        />
                                        )}
                                    </FormItem>
                                    </Col>
                                    <Col span={12} >
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="教学点"
                                    >
                                        {getFieldDecorator('teachCenter', { initialValue: this.state.pagingSearch.teachCenter })(

                                        <Select>
                                            <Option value="">全部</Option>
                                            {this.state.bz_teach_center_list.map((i, index) => {
                                            return <Option value={i.value.toString()} key={i.value}>{i.title}</Option>
                                            })}
                                        </Select>
                                        )}
                                    </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'资料类型'} >
                                            {getFieldDecorator('materialType', { initialValue: this.state.pagingSearch.materialType })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.material_type.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'资料名称'} >
                                            {getFieldDecorator('materialName', { initialValue: this.state.pagingSearch.materialName })(
                                            <Input placeholder="资料名称" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'项目'}>
                                            {getFieldDecorator('itemId', {
                                            initialValue: this.state.pagingSearch.itemId
                                            })(
                                            <SelectItem
                                                scope={'my'}
                                                hideAll={false}
                                                hidePleaseSelect={true}
                                                onSelectChange={(value) => {
                                                this.state.pagingSearch.itemId = value;
                                                this.setState({ pagingSearch: this.state.pagingSearch });
                                                }}
                                            />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="科目"
                                        >
                                            {getFieldDecorator('courseCategoryId', { initialValue: this.state.pagingSearch.courseCategoryId })(
                                            <SelectItemCourseCategory isMain={true} itemId={this.state.pagingSearch.itemId} hideAll={false} />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                                            {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                                            <Input placeholder="学生姓名" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'订单号'} >
                                            {getFieldDecorator('orderSn', { initialValue: this.state.pagingSearch.orderSn })(
                                            <Input placeholder="订单号" />
                                            )}
                                        </FormItem>
                                    </Col>

                                    <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label="领取日期">
                                                {getFieldDecorator('receiveStartDate', { initialValue:this.state.pagingSearch.receiveStartDate?[moment(this.state.pagingSearch.receiveStartDate,dateFormat),moment(this.state.pagingSearch.receiveEndDate,dateFormat)]:[]})(
                                                    <RangePicker
                                                        format={dateFormat}
                                                        style={{width:220}}  
                                                    />
                                                )}
                                            </FormItem>
                                        </Col>
                                    
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'教师'} >
                                            {getFieldDecorator('teacher', { initialValue: (!this.state.teacherIdData.length ? [] : [{
                                                id: this.state.teacherIdData[0].id,
                                                name: this.state.teacherIdData[0].name
                                            }]) })(
                                                <EditableTeacher  maxTags={1} />
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
                            rowKey={'materialId'}
                            bordered
                            scroll={{ x: 1800 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="end" align="middle" type="flex">
                                <Col span={4}>
                                <FileDownloader
                                    apiUrl={'/edu/materialReceive/exportMaterialReceives'}//api下载地址
                                    method={'post'}//提交方式
                                    options={this.state.pagingSearch}//提交参数
                                    title={'导出'}
                                    type={'export'}
                                    />
                                </Col>
                                <Col span={20} className='search-paging-control'>
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
const WrappedMaterialGetQuery = Form.create()(MaterialGetQuery);

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
        BrochureReleaseDesk: bindActionCreators(BrochureReleaseDesk, dispatch),
        addOrEditOrDelMaterial: bindActionCreators(addOrEditOrDelMaterial, dispatch),
        addOrRemoveChildMaterials: bindActionCreators(addOrRemoveChildMaterials, dispatch),
        getTeachCenterByBranchId: bindActionCreators(getTeachCenterByBranchId, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedMaterialGetQuery);
