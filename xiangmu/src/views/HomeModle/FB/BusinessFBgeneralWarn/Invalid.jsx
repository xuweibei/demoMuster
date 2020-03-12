import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { message, Modal, Form, Row, Col,Button,Table, Pagination,Radio } from 'antd';
const RadioGroup = Radio.Group;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange} from '@/utils/componentExt';

import FileDownloader from '@/components/FileDownloader';

import { getViewEditModeTitle} from '@/utils'; 
import { AbouTtoFail } from '@/actions/admin';
import ContentBox from '@/components/ContentBox';
 
const FormItem = Form.Item; 
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class ProductView extends React.Component {
    constructor(props) {
        super(props)
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);

        this.state = {
            pagingSearch: {
              currentPage: 1,
              pageSize: 10,
            },
            totalRecord: 0,
            dataModel: props.currentDataModel,//数据模型
            editMode: props.editMode,//编辑模式
            loading: true,
            data: [],
        };
            
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
        this.onSearch = onSearch.bind(this);
    }

    componentWillMount() {
        this.onSearch();
    }
    fetch(params = {}) {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.setState({loading:true})
        if(this.props.operationType == 'Three'){
            condition.operationType = 1; 
            this.props.AbouTtoFail(condition).payload.promise.then((response) => {
                let data = response.payload.data; 
                if(data.state == 'success'){ 
                    this.setState({ pagingSearch: condition, ...data, loading: false })
                }else{
                    message.error(data.msg)
                }
            })
        }else if(this.props.operationType == 'Fifteen'){
            condition.operationType = 2;
            this.props.AbouTtoFail(condition).payload.promise.then((response) => {
                let data = response.payload.data; 
                if(data.state == 'success'){ 
                    this.setState({ pagingSearch: condition,...data, loading: false })
                }else{
                    message.error(data.msg)
                }
            })
        }
    }
    onCancel = () => {
        this.props.viewCallback();
    }

    //标题
    getTitle() {
        return '3日后市场保护失效学生'
    }

    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode, '')}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        else {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
    }
    columns = [
        {
            title: '所属区域',
            fixed:"left",
            width:'120',
            dataIndex: 'regRegionName',
        },
        {
            title: '市场人员',
            width:'120',
            dataIndex: 'benefitMarketUserName',
        },
        {
            title: '电咨人员',
            width:'120',
            dataIndex: 'benefitPconsultUserName',
        },
        {
            title: '面咨人员',
            width:'120',
            dataIndex: 'benefitFconsultUserName',
        },
        {
            title: '学生姓名',
            width:'120',
            dataIndex: 'studentName',
        },
        {
            title: '性别',
            width:'120',
            dataIndex: 'sexName',
        },
        {
            title: '学生来源',
            width:'120',
            dataIndex: 'regSourceName',
        },
        {
            title: '目前情况',
            width:'120',
            dataIndex: 'isStudy',
        },
        {
            title: '在读高校',
            width:'120',
            dataIndex: 'universityName',
        },
        {
            title: '手机',
            width:'120',
            dataIndex: 'mobile',
        },
        {
            title: '微信', 
            dataIndex: 'weixin',
        },
        {
            title: 'QQ',
            fixed:"right",
            width:'180',
            dataIndex: 'qq'
        }];
    //多种模式视图处理
    renderEditModeOfView() { 
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.state.editMode) { 
            case "View": 
                    block_content = (
                        <div style={{ width: '90%' }}>  
                            {/* 数据表格 */}
                            <div className="search-result-list">
                                <Table columns={this.columns} //列定义
                                    loading={this.state.loading}
                                    pagination={false}
                                    dataSource={this.state.data}//数据
                                    bordered
                                    scroll={{ x: 1600 }}
                                />
                            </div>
                            <div className="space-default"></div>
                            <div className="search-paging">
                                <Row justify="space-between" align="middle" type="flex">
                                </Row>
                                <Row justify="end" align="right" type="flex">
                                <Col span={2}>
                                <FileDownloader
                                    apiUrl={'/edu/branchIndex/exportStudentListForStudentCount'}//api下载地址
                                    method={'post'}//提交方式
                                    options={this.state.pagingSearch}//提交参数
                                    title={'导出'}
                                    >
                                </FileDownloader>
                                </Col>
                                <Col span={22} className={'search-paging-control'} align="right">
                                    <Pagination 
                                    showSizeChanger
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
                    ) 
                break;
        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        let block_editModeView = this.renderEditModeOfView();
        if (this.state.editMode == 'View') {

            return (
                <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                    <div className="dv_split"></div>
                    {block_editModeView}
                    <div className="dv_split"></div>
                </ContentBox> 

            );
        }
        else {
            return block_editModeView;
        }
    }
}

const WrappedProductView = Form.create()(ProductView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        AbouTtoFail: bindActionCreators(AbouTtoFail, dispatch), 
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedProductView);
