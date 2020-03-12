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
import { queryMaterialsList, addOrEditOrDelMaterial, addOrRemoveChildMaterials } from '@/actions/material';
//业务数据视图（增、删、改、查)
import MaterialsAreaView from '../MaterialsAreaView';
import MaterialsSetUserView from '../MaterialsSetUserView';
import MaterialsAddUserView from '../MaterialsAddUserView';
import MaterialManageView from './view';
import DropDownButton from '@/components/DropDownButton';
import ContentBox from '@/components/ContentBox';
import FileDownloader from '@/components/FileDownloader';
import EditableCourseName from '@/components/EditableCourseName';
import EditableTeacher from '@/components/EditableTeacher';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';

class MaterialsManage extends React.Component {

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
            },

            data: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: [],
            teacherIdData: [],
            courseIdData: [],
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status','material_type','dic_YesNo']);
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
            title: '打包资料',
            width: 80,
            dataIndex: 'isPack',
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
            title: '操作',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (text, record) => {
                return <DropDownButton>
                    <Button onClick={() => { this.onLookView('EditArea', { ...record }) }}>编辑</Button>
                    { record.packFlag && <Button onClick={() => { this.onLookView('EditUser', { ...record }) }}>资料({ record.materialPackCount })</Button> }
                    <Button onClick={() => { this.onLookView('View', { ...record }) }}>查看</Button>
                </DropDownButton>
            }
        }];




    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;

        this.setState({ teacherIdData: condition.teacher });
        this.setState({ courseIdData: condition.courseId });    

        condition.teacher = condition.teacher.length ? condition.teacher[0].id : '';
            
        condition.courseId = condition.courseId.length ? condition.courseId[0].id : '';

        this.props.queryMaterialsList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false });
                message.error(data.message);
            }
            else {
                this.setState({ pagingSearch: condition, ...data, loading: false });
                this.setState({ UserSelecteds: [] });
            }
        })
    }

    onBatchDelete = () => {
        Modal.confirm({
            title: '已使用的资料不能被删除，可以做停用处理，信息删除后将不能恢复，是否确定删除选定资料信息?',
            content: '点击确认删除所选资料!否则点击取消！',
            onOk: () => {
                this.props.addOrEditOrDelMaterial({ materialIds: this.state.UserSelecteds.join(','), delFlag: 1 }).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        message.error(data.message);
                    }
                    else {
                        this.setState({ UserSelecteds: [] })
                        this.onSearch();
                    }
                })
            },
            onCancel: () => {
                console.log('Cancel');
            },
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
                case "Delete":
                    break;
                case "AddArea":
                case "EditArea":
                    this.props.addOrEditOrDelMaterial(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            message.success('操作成功！');
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })

                    break;
                case "AddUser":
                    if (!dataModel.cancel) {
                        let params = {
                            materialId: dataModel.materialId,
                            childMaterialIds: dataModel.childMaterialIds
                        }
                        this.props.addOrRemoveChildMaterials(params).payload.promise.then((response) => {
                            let data = response.payload.data;
                            if (data.result === false) {
                                message.error(data.message);
                            }
                            else {
                                //进入设置用户页
                                this.onLookView("EditUser", dataModel);
                            }
                        })
                    } else {
                        dataModel.cancel = false;
                        this.onLookView("EditUser", dataModel);
                    }
                    break;
                case "EditUser":
                    if (!dataModel.cancel) {
                        this.onLookView("AddUser", dataModel);
                    } else {
                        this.onSearch();
                        this.onLookView("Manage", null);
                    }
                    //提交
                    break;

            }
        }
    }


    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>

        switch (this.state.editMode) {
            case 'View'://查看
                block_content = <MaterialManageView
                viewCallback={this.onViewCallback}
                {...this.state}/>
            break;
            case "EditArea"://编辑
            case "AddArea"://增加
                block_content = <MaterialsAreaView
                    viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "EditUser"://资料
            case "Delete":
                block_content = <MaterialsSetUserView
                    viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "AddUser"://增加子资料
                block_content = <MaterialsAddUserView
                    viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:

                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(<Button onClick={() => { this.onLookView('AddArea', { typeFlag: '', statusFlag: 1, outsideFlag: '', packFlag: '', itemId: '', courseCategoryId: '' }) }
                } icon="plus" className="button_dark" >增加</Button>);
                extendButtons.push(
                    <FileDownloader
                      apiUrl={'/edu/material/exportMaterials'}//api下载地址
                      method={'post'}//提交方式
                      options={this.state.pagingSearch}//提交参数
                      title={'导出'}
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
                                        <FormItem {...searchFormItemLayout} label={'资料状态'} >
                                            {getFieldDecorator('materialStatus', { initialValue: this.state.pagingSearch.materialStatus })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.dic_Status.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
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
                                            <SelectItemCourseCategory isMain={true} itemId={this.state.pagingSearch.itemId} hideAll={false}
                                                onSelectChange={(value) => {
                                                    this.state.pagingSearch.courseCategoryId = value;
                                                    this.setState({ pagingSearch: this.state.pagingSearch });
                                                }}
                                            />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="课程名称"
                                        >
                                            {getFieldDecorator('courseId', { initialValue: (!this.state.courseIdData.length ? [] : [{
                                                id: this.state.courseIdData[0].id,
                                                name: this.state.courseIdData[0].name
                                            }]) })(
                                                <EditableCourseName itemId={this.state.pagingSearch.itemId} courseCategoryId={this.state.pagingSearch.courseCategoryId} maxTags={1} />
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
                                    <Col span={12} >
                                        <FormItem {...searchFormItemLayout}
                                            label="是否外购">
                                            {getFieldDecorator('isOutside', { initialValue: this.state.pagingSearch.isOutside })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.dic_YesNo.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem {...searchFormItemLayout}
                                            label="是否打包资料">
                                            {getFieldDecorator('isPack', { initialValue: this.state.pagingSearch.isPack })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.dic_YesNo.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
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
                            rowSelection={rowSelection}
                            bordered
                            scroll={{ x: 1400 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="end" align="middle" type="flex">
                                <Col span={4}>
                                    <div className='flex-row'>
                                        {this.state.UserSelecteds.length > 0 ? <Button onClick={this.onBatchDelete} icon="delete">批量删除</Button> : <Button disabled icon="delete">批量删除</Button>}
                                    </div>
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
const WrappedMaterialsManage = Form.create()(MaterialsManage);

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
        addOrEditOrDelMaterial: bindActionCreators(addOrEditOrDelMaterial, dispatch),
        addOrRemoveChildMaterials: bindActionCreators(addOrRemoveChildMaterials, dispatch),

    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedMaterialsManage);
