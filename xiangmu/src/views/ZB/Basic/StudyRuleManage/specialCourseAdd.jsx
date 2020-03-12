import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, InputNumber, Select, Button, Icon, Table, Pagination, Checkbox } from 'antd';
//组件实例模板方法引入
import { searchFormItemLayout,searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import { getViewEditModeTitle } from '@/utils';
import ContentBox from '@/components/ContentBox';

//业务接口方法引入
import { normalCourseList } from '@/actions/base';
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
class SpecialCourseAdd extends React.Component {
    constructor(props) {
        super(props)
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
        this.state = {
            data: [],//数据模型
            selectedRows: [],
            selectedRowKeys: []
        };
        
    }
    componentWillMount() {
        //载入需要的字典项
        //this.loadBizDictionary(['dic_Status', 'teach_center_type']);

        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
        
    }
   
    onCancel = () => {
        this.props.viewCallback();
    }
    compare(x,y) {
        if (x < y) {
            return -1;
        } else if (x > y) {
            return 1;
        } else {
            return 0;
        }
    }
    onSubmit = () => {

        if(this.state.selectedRows.length){
            let params = [];
            let studyPeriodList = document.querySelectorAll('.ant-table-wrapper .studyPeriod');
            let hasPeriod = true;
            this.state.selectedRowKeys.forEach((item,index)=>{
                let studyPeriod = studyPeriodList[item].querySelector('.ant-input-number-input').value;
                if(!Number(studyPeriod)){
                    message.error('所选科目的学籍长度不能为空！');
                    hasPeriod = false;
                    return;
                }
                if(Number(studyPeriod)*10%5 != 0){
                    message.error('学籍长度非整年时，请保留一位小数且小数位只能设置成 0.5（半年）');
                    hasPeriod = false;
                    return;
                }

                let ruleObj = {
                    'courseId': this.state.selectedRows[index].courseCategoryId,
                    'studyPeriod': Number(studyPeriod),
                };
                params.push(ruleObj);
            })

            if(!hasPeriod) return;

            this.props.form.validateFields((err, values) => {
                if (!err) {
                    this.setState({ loading: true });
                    setTimeout(() => {
                        this.setState({ loading: false });
                    }, 3000);//合并保存数据
                    this.props.viewCallback({itemId: this.props.pagingSearch.itemId,batchId:this.props.pagingSearch.batchId, json: JSON.stringify(params) });//合并保存数据
                }
            });
        }else{
            message.error('请选择科目！');
            return;
        }

        
    }
    //table 输出列定义
    columns = [
        {
            title: '科目',
            dataIndex: 'name'
        }, 
        {
            title: '学籍长度(年)',
            dataIndex: 'studyPeriod',
            render: (text, record, index) => {
                return <InputNumber min={0} step={0.5} defaultValue='' className="studyPeriod"/>
            }
        }

    ];
    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        console.log(this.props)
        var condition = this.props.pagingSearch;
        this.props.normalCourseList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state != 'success') {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.setState({ pagingSearch: condition, ...data, loading: false })
            }
        })
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}特殊科目`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
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

    //多种模式视图处理
    renderEditModeOfView() {
        console.log(this.props)
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                var rowSelection = {
                    onChange: (selectedRowKeys, selectedRows) => {
                        this.setState({ selectedRows: selectedRows })
                        selectedRowKeys = selectedRowKeys.sort(this.compare)
                        this.setState({ selectedRowKeys: selectedRowKeys })
                    },
                    getCheckboxProps: record => ({
                        disabled: false,    // Column configuration not to be checked
                    }),
                };
                block_content = (
                    <div className="search-result-list">
                        <Form>
                            <Row gutter={24}>
                                <Col span={12}> 
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="批次">
                                        {this.props.batch.batchArrNext.batchName?this.props.batch.batchArrNext.batchName:this.props.batch.batchArrNext.props?this.props.batch.batchArrNext.props.children:''}
                                    </FormItem>
                                </Col>
                                <Col span={12}> 
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="项目">
                                        {this.props.currentDataModel.title}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Table columns={this.columns} //列定义
                                loading={this.state.loading}
                                pagination={false}
                                rowSelection={rowSelection}
                                dataSource={this.state.data}//数据
                                bordered
                            />
                        </Form>
                    </div>
                    
                );
                break;

        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        let block_editModeView = this.renderEditModeOfView();
        return (
            <div className="studyRuleView">
                <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                    <div className="dv_split"></div>
                    {block_editModeView}
                    <div className="dv_split"></div>
                </ContentBox>
            </div>
        );
    }
}

const WrappedSpecialCourseAdd = Form.create()(SpecialCourseAdd);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //各业务接口
        normalCourseList: bindActionCreators(normalCourseList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedSpecialCourseAdd);
