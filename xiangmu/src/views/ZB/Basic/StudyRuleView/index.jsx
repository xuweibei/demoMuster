import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, InputNumber, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox } from 'antd';

import './index.less'

import { getDictionaryTitle, getViewEditModeTitle, dataBind, split } from '@/utils';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';

//业务接口方法引入
import { getStudyRuleList, editStudyRule, addStudyRule, deleteStudyRule } from '@/actions/base';
//组件实例模板方法引入
import {
    loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
    searchFormItemLayout, searchFormItemLayout24,
    onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
  } from '@/utils/componentExt';
const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class StudyRuleView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            dataLength: props.currentDataModel.length
        };
        
    }
    componentWillMount() {
        if(!this.state.dataModel.length){
            this.add(1);
        }
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        //表单验证后，合并数据提交
        // [{'studyRuleId':'6c2a6e5e5b0d11e89e4af8bc129b92ad','courseCategoryBeginNum':'1','courseCategoryEndNum':'4','studyPeriod':'1.5'},{'studyRuleId':'6c2a6e5e5b0d11e89e4af8bc129b92ad','courseCategoryBeginNum':'6','courseCategoryEndNum':'7','studyPeriod':'1.5'}]
        // 修改的时候 需要传studyRuleId 如果添加新的数据 那么studyRuleId为空''
        let beginList = document.querySelectorAll('.ant-table-fixed-left .courseCategoryBeginNum');
        let endList = document.querySelectorAll('.ant-table-fixed-left .courseCategoryEndNum');
        let studyPeriodList = document.querySelectorAll('.ant-table-scroll .studyPeriod');
        let params = [], hasBegin = true, hasPeriod = true, hasEmptys = [];
        beginList.forEach((item,index)=>{
            let ruleId = item.parentNode.dataset.id;
            let courseCategoryBeginNum = item.querySelector('.ant-input-number-input').value;
            let courseCategoryEndNum = endList[index].querySelector('.ant-input-number-input').value;
            let studyPeriod = studyPeriodList[index].querySelector('.ant-input-number-input').value;

            if(!Number(courseCategoryBeginNum)){
                message.error('开始科目数不能为空！');
                hasBegin = false;
                return;
            }
            if(courseCategoryEndNum && Number(courseCategoryEndNum)<Number(courseCategoryBeginNum)){
                message.error('截止科目数不能小于开始科目数且科目数不能重叠！');
                hasBegin = false;
                return;
            }
            if(!Number(studyPeriod)){
                message.error('学籍长度不能为空！');
                hasPeriod = false;
                return;
            }
            if(Number(studyPeriod)*10%5 != 0){
                message.error('学籍长度非整年时，请保留一位小数且小数位只能设置成 0.5（半年）');
                hasPeriod = false;
                return;
            }
            let ruleObj = {
                'studyRuleId': ruleId?ruleId:'',
                'courseCategoryBeginNum': Number(courseCategoryBeginNum),
                'courseCategoryEndNum': courseCategoryEndNum?Number(courseCategoryEndNum):'',
                'studyPeriod': Number(studyPeriod),
            };

            params.push(ruleObj);

            if(!courseCategoryEndNum){
                hasEmptys.push(1);
            }
        })
        
        if(!hasBegin || !hasPeriod){
            return;
        }

        if(hasEmptys.length > 1){
            message.error('截止科目数不能小于开始科目数且科目数不能重叠！');
            return;
        }

        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                setTimeout(() => {
                    this.setState({ loading: false });
                }, 3000);//合并保存数据
                this.props.viewCallback({itemId: this.state.dataModel.length?this.state.dataModel[0].itemId:this.props.pagingSearch.itemId,batchId:this.props.pagingSearch.batchId, json: JSON.stringify(params) });//合并保存数据
            }
        });
    }
    //table 输出列定义
    columns = [
        {
            title: '科目数(包含)',
            width: 280,
            fixed: 'left',
            dataIndex: 'courseCategoryBeginNum',
            render: (text, record, index) => {
                
                if(index == 0){
                    return <div data-id={record.studyRuleId}><InputNumber min={1} max={1} step={1} defaultValue={record.courseCategoryBeginNum} className="courseCategoryBeginNum"/>至<InputNumber  min={0} step={1} defaultValue={record.courseCategoryEndNum?record.courseCategoryEndNum:''} className="courseCategoryEndNum"/></div>
                }else{
                    return <div data-id={record.studyRuleId}><InputNumber min={1} step={1} defaultValue={record.courseCategoryBeginNum} className="courseCategoryBeginNum"/>至<InputNumber  min={0} step={1} defaultValue={record.courseCategoryEndNum?record.courseCategoryEndNum:''} className="courseCategoryEndNum"/></div>
                }
                
            }
        }, 
        {
            title: '学籍长度(年)',
            dataIndex: 'studyPeriod',
            render: (text, record, index) => {
                return <InputNumber min={0} step={0.5} defaultValue={record.studyPeriod?record.studyPeriod/12:''} className="studyPeriod"/>
            }
        },
        {
            title: '操作',
            key: 'action',
            // fixed: 'right',
            width: 200,
            render: (text, record,index) => {
                if((this.state.dataLength-1) == index){
                   if(record.studyRuleId){
                        return (
                            <Row justify="space-around" type="flex">
                                <Button onClick={() => { this.add(index) }}>新增</Button>
                                <Button onClick={() => { this.onDeltet(record.studyRuleId) }}>删除</Button>
                            </Row>
                        )
                    }else{
                        return (
                            <Row justify="space-around" type="flex">
                                <Button onClick={() => { this.add(index) }}>新增</Button>
                                <Button onClick={() => { this.deltetModel() }}>删除</Button>
                            </Row>
                        )
                    }
                   
                }
            }
                    
        },

    ];
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}学籍规则`;
    }
    //增加
    add(index) {

        const newData = [...this.state.dataModel];
        const addData = {
            "studyRuleId" : '',
            "itemId" : this.props.pagingSearch.itemId,
            "courseCategoryBeginNum" : newData.length?newData[index].courseCategoryEndNum+1:1,
            "courseCategoryEndNum" : '',
            "studyPeriod" : '',
        };
        newData.splice(index+1,0,addData);

        this.setState({ dataModel: newData,dataLength:newData.length});
        
    }
    onDeltet(studyRuleId) {
        Modal.confirm({
            title: '是否删除所选学籍规则?',
            content: '点击确认删除所选学籍规则!否则点击取消！',
            onOk: () => {
                this.setState({ loading: true });
                setTimeout(() => {
                    this.setState({ loading: false });
                }, 3000);//合并保存数据
                this.props.viewCallback({studyRuleId: studyRuleId,del:true });//合并保存数据
            }
        })
      
    }
    deltetModel() {
        const newData = [...this.state.dataModel];

        newData.splice(newData.length-1,1);

        this.setState({ dataModel: newData,dataLength:newData.length});
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
                block_content = (
                    <div className="search-result-list">
                        <Form>
                            <Row gutter={24}>
                                <Col span={12}> 
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="批次">
                                        {this.props.batchArrNext.batchName?this.props.batchArrNext.batchName:this.props.batchArrNext.props?this.props.batchArrNext.props.children:''}
                                    </FormItem>
                                </Col>
                                <Col span={12}> 
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="项目">
                                        {this.props.currentItem.title}
                                    </FormItem>
                                </Col>
                            </Row>
                        <Table columns={this.columns} //列定义
                            loading={this.state.loading}
                            pagination={false}
                            dataSource={this.state.dataModel}//数据
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

const WrappedStudyRuleView = Form.create()(StudyRuleView);
export default WrappedStudyRuleView;