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
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { getUserByNotInList } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import EditableCourseName from '@/components/EditableCourseName';
import EditableTeacher from '@/components/EditableTeacher';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import {
    queryMaterialsList
} from '@/actions/material';

class MaterialsAddUserView extends React.Component {
    constructor(props) {
        super(props)
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);

        this.state = {
            dataModel: props.currentDataModel,//数据模型
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                materialType: '',
                itemId: '',
                courseCategoryId:'',

            },
            data: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: []
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [
        {
            title: '资料名称',
            width: 220,
            fixed: 'left',
            dataIndex: 'materialName'
        },
        {
            title: '项目',
            dataIndex: 'itemName',
            width:100,
        },
        {
            title: '科目',
            dataIndex: 'courseCategoryName',
            width:100,
        },
        {
            title: '课程',
            dataIndex: 'courseName',
        },
        {
            title: '资料类型',
            width: 100,
            dataIndex: 'materialType',
        },
        {
            title: '状态',
            width: 80,
            dataIndex: 'materialStatus',
        },
        {
            title: '外购',
            width: 80,
            dataIndex: 'isOutside',
        },
        {
            title: '教师',
            dataIndex: 'teacher',
            width:120,
        },
        {
            title: '创建人',
            width:120,
            dataIndex: 'founder',
        },
        {
            title: '最新修改人',
            width:120,
            dataIndex: 'modifier',
        },
        {
            title: '最新修改日期',
            fixed: 'right',
            width:120,
            dataIndex: 'modifyDate',
            render: (text, record, index) => {
                return timestampToTime(record.modifyDate);
            }
        },
      ];


    onSubmit = () => {
        this.props.viewCallback({ ...this.state.dataModel, materialId: this.state.dataModel.materialId, childMaterialIds: this.state.UserSelecteds.join(',') });
    }
    onCancel = () => {
        this.props.viewCallback({ ...this.state.dataModel,cancel:true});
    }


    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        condition.materialId = this.state.dataModel.materialId;
        condition.subFlag = 1;//查询未打包列表
        this.props.queryMaterialsList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                this.setState({ pagingSearch: condition, ...data, loading: false })
            }
            else {
                this.setState({ loading: false })
                message.error(data.message);
            }
        })
        
    }


    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
        //除查询外，其他扩展按钮数组
        let extendButtons = [];

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
                        <Row justify="center" gutter={24} align="middle" type="flex">

                            <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="打包资料名称"
                                >
                                    {this.state.dataModel.materialName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'资料类型'} >
                                    {getFieldDecorator('materialType', { initialValue: this.state.pagingSearch.materialType })(
                                        <Select>
                                            <Option value="">全部</Option>
                                            {this.props.material_type.map((item, index) => {
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
                            <Col span={12} >
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="所属课程"
                                >
                                    {getFieldDecorator('courseId', { initialValue: [] })(
                                        <EditableCourseName  maxTags={1} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'教师'} >
                                    {getFieldDecorator('teacher', { initialValue: [] })(
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
                    rowKey={'materialId'}
                    rowSelection={rowSelection}
                    pagination={false}
                    dataSource={this.state.data}//数据
                    bordered
                    scroll={{ x: 1500 }}
                />
                <div className="space-default"></div>
                <div className="search-paging">
                    <Row justify="space-between" align="middle" type="flex">
                         <Col span={6}>
                            {
                                this.state.UserSelecteds.length ? <Button onClick={this.onSubmit} icon="save">确定</Button>
                                : <Button disabled icon="save">确定</Button>
                            }
                            <div className="split_button"></div>
                            <Button onClick={this.onCancel} icon="rollback">返回</Button>
                        </Col>
                        <Col span={18} className='search-paging-control'>
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


        return block_content;
    }
}
//表单组件 封装
const WrappedMaterialsAddUserView = Form.create()(MaterialsAddUserView);

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
        queryMaterialsList: bindActionCreators(queryMaterialsList, dispatch),

    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedMaterialsAddUserView);
